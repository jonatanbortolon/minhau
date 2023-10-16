import { prismaClient } from '@/libs/prisma'
import { petModel } from '@/models/pet'
import { petImageModel } from '@/models/petImage'
import { updatePetSchema } from '@/schemas/updatePet'
import { PetSex, PetType } from '@prisma/client'
import { merge, omit } from 'lodash'
import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/authOptions'
import { userModel } from '@/models/user'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user = null } = (await getServerSession(authOptions)) ?? {
      user: null,
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          payload: { message: 'Você precisa estar autenticado.' },
        },
        { status: 401 },
      )
    }

    const [pet = null] = await prismaClient.$queryRaw<
      {
        id: string
        name: string
        description: string | null
        sex: PetSex
        type: PetType
        adoptedAt: Date | null
        createdAt: Date
        userId: string
        distance: number
        favorite: boolean
        chatId: string | null
        images: {
          id: string
          path: string
        }[]
      }[]
    >`
    SELECT DISTINCT ON ("Pet".id)
    "Pet".id, name, description, sex, type, "adoptedAt", "Pet"."userId", "Chat".id as "chatId", "Pet"."createdAt",
    json_agg(json_build_object('id', "PetImage".id, 'path', "PetImage".path)) AS images,
    EXISTS (
      SELECT *
      FROM "PetFavorite"
      WHERE "userId" = ${user.id}
      AND "petId" = "Pet".id
    ) AS favorite,
    (ST_Distance(
      (
        SELECT ST_GeogFromText(CONCAT('SRID=4326;POINT (', latitude, ' ', longitude, ')'))
        FROM "Location"
        WHERE "Location"."userId" = "Pet"."userId"
      ),
      (
        SELECT ST_GeogFromText(CONCAT('SRID=4326;POINT (', latitude, ' ', longitude, ')'))
        FROM "Location"
        WHERE "Location"."userId" = ${user.id}
      )
    )
    ) AS distance
    FROM "Pet"
    INNER JOIN "PetImage" ON "PetImage"."petId" = "Pet".id
    LEFT JOIN "Chat" ON "Chat"."petId" = "Pet".id AND ("Chat"."user1Id" = ${user.id} OR "Chat"."user2Id" = ${user.id})
    WHERE "Pet".id = ${params.id}
    GROUP BY "Pet".id, "Chat".id
    `

    if (!pet) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Pet não encontrado.',
          },
        },
        { status: 404 },
      )
    }

    const owner = await userModel.findUnique({ where: { id: pet.userId } })

    if (!owner) {
      throw new Error('Failed to find pet owner.')
    }

    revalidateTag(`pet-${pet.id}`)

    return NextResponse.json({
      success: true,
      payload: merge(omit(pet, ['userId']), {
        owner: {
          id: owner.id,
          name: owner.name,
          image: owner.image,
        },
      }),
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        payload: {
          message:
            'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
        },
      },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user = null } = (await getServerSession(authOptions)) ?? {
      user: null,
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          payload: { message: 'Você precisa estar autenticado.' },
        },
        { status: 401 },
      )
    }

    const pet = await petModel.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!pet) {
      return NextResponse.json(
        {
          success: false,
          payload: { message: 'Pet não encontrado.' },
        },
        { status: 404 },
      )
    }

    if (pet.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Pet não encontrado.',
          },
        },
        { status: 404 },
      )
    }

    const formData = await request.formData()

    const body: { [key: string]: any } = {}

    for (const [key] of formData) {
      if (key.endsWith('s')) {
        body[key] = formData.getAll(key)
      } else {
        body[key] = formData.get(key)
      }
    }

    if (!body.addedImages) {
      body.addedImages = []
    }

    if (!body.deletedImages) {
      body.deletedImages = []
    }

    if (typeof body.isAdopted !== 'boolean') {
      body.isAdopted = body.isAdopted === 'true'
    }

    const response = updatePetSchema.safeParse(body)

    if (!response.success) {
      const error = response.error.issues[0]

      return NextResponse.json(
        {
          success: false,
          payload: {
            message: error.message,
            input: error.path.at(-1),
          },
        },
        { status: 400 },
      )
    }

    const data = response.data

    const petImages = await petImageModel.findMany({
      where: {
        petId: pet.id,
      },
    })

    if (
      petImages.length + data.addedImages.length - data.deletedImages.length <
      1
    ) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'O pet precisa de pelo menos uma foto.',
            input: 'deletedImages',
          },
        },
        { status: 400 },
      )
    }

    if (
      petImages.length + data.addedImages.length - data.deletedImages.length >
      15
    ) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'O pet pode ter no máximo 15 fotos.',
            input: 'addedImages',
          },
        },
        { status: 400 },
      )
    }

    const imagesBackups = await Promise.all(
      petImages
        .filter((petImage) => data.deletedImages.includes(petImage.id))
        .map(async (petImage) => {
          const response = await fetch(petImage.path).then((res) => res.blob())

          return {
            id: petImage.id,
            arrayBuffer: response,
          }
        }),
    )

    try {
      await prismaClient.$transaction(async (tx) => {
        const imagesToAdd = await Promise.all(
          data.addedImages.map(async (blobImage) => {
            const response = await put(`pet/${pet.id}.jpg`, blobImage, {
              access: 'public',
              addRandomSuffix: true,
            })

            return { path: response.url }
          }),
        )

        const imagesToDelete = data.deletedImages.map((image) => ({
          id: image,
        }))

        await tx.pet.update({
          where: {
            id: pet.id,
          },
          data: {
            ...(imagesToAdd.length > 0 && imagesToDelete.length > 0
              ? {
                  images: {
                    ...(imagesToAdd.length > 0
                      ? {
                          createMany: {
                            data: imagesToAdd,
                          },
                        }
                      : {}),
                    ...(imagesToDelete.length > 0
                      ? {
                          deleteMany: imagesToDelete,
                        }
                      : {}),
                  },
                }
              : {}),
            name: data.name,
            description: data.description,
            sex: data.sex,
            type: data.type,
            adoptedAt: !data.isAdopted ? null : new Date(),
          },
        })

        for await (const petImage of petImages.filter((petImage) =>
          data.deletedImages.includes(petImage.id),
        )) {
          await del(petImage.path)
        }
      })
    } catch (error) {
      console.log(error)

      for await (const imageBackup of imagesBackups) {
        const response = await put(
          `pet/${pet.id}.jpg`,
          imageBackup.arrayBuffer,
          {
            access: 'public',
            addRandomSuffix: true,
          },
        )

        await petImageModel.updateMany({
          where: {
            id: imageBackup.id,
          },
          data: {
            path: response.url,
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Erro ao deletar o pet.',
          },
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      payload: null,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        payload: {
          message:
            'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
        },
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user = null } = (await getServerSession(authOptions)) ?? {
      user: null,
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          payload: { message: 'Você precisa estar autenticado.' },
        },
        { status: 401 },
      )
    }

    const pet = await petModel.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!pet) {
      return NextResponse.json(
        {
          success: false,
          payload: { message: 'Pet não encontrado.' },
        },
        { status: 404 },
      )
    }

    if (pet.id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Pet não encontrado.',
          },
        },
        { status: 404 },
      )
    }

    const petImages = await petImageModel.findMany({
      where: {
        petId: pet.id,
      },
    })

    const imagesBackups = await Promise.all(
      petImages.map(async (petImage) => {
        const response = await fetch(petImage.path).then((res) => res.blob())

        return {
          id: petImage.id,
          arrayBuffer: response,
        }
      }),
    )

    try {
      for await (const petImage of petImages) {
        await del(petImage.path)
      }

      await prismaClient.$transaction(async (tx) => {
        tx.pet.delete({
          where: {
            id: pet.id,
          },
        })
      })
    } catch (error) {
      for await (const imageBackup of imagesBackups) {
        const response = await put(
          `pet/${pet.id}.jpg`,
          imageBackup.arrayBuffer,
          {
            access: 'public',
            addRandomSuffix: true,
          },
        )

        await petImageModel.updateMany({
          where: {
            id: imageBackup.id,
          },
          data: {
            path: response.url,
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Erro ao deletar o pet.',
          },
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      payload: null,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        payload: {
          message:
            'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
        },
      },
      { status: 500 },
    )
  }
}
