import { prismaClient } from '@/libs/prisma'
import { petModel } from '@/models/pet'
import { createPetSchema } from '@/schemas/createPet'
import { getFilters } from '@/utils/getFilters'
import { PetType, PetSex, Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import z from 'zod'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/authOptions'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    const rawFilters = getFilters(request.url, ['name', 'adopted'])

    const response = z
      .object({
        type: z.nativeEnum(PetType).nullable().default(null),
        sex: z.nativeEnum(PetSex).nullable().default(null),
        distance: z
          .number({
            required_error: 'A distancia é obrigatória.',
          })
          .min(1, {
            message: 'A distancia tem que ser maior que 1km.',
          })
          .max(100, {
            message: 'A distancia tem que ser menor que 100km.',
          }),
        page: z
          .number({
            required_error: 'A página é obrigatoria.',
          })
          .int({
            message: 'A página tem que ser um numero inteiro.',
          })
          .min(0, {
            message: 'A página mínima tem que ser maior ou igual a 0.',
          }),
      })
      .safeParse(rawFilters)

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

    const filters = response.data

    const rows = await prismaClient.$queryRaw<
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
        image: {
          id: string
          path: string
        }
      }[]
    >`
    SELECT * FROM (SELECT DISTINCT ON ("Pet".id)
    "Pet".id, name, description, sex, type, "adoptedAt", "Pet"."userId", "Pet"."createdAt",
    json_build_object('id', "PetImage".id, 'path', "PetImage".path) AS image, 
    EXISTS (
      SELECT *
      FROM "PetFavorite"
      WHERE "userId" = ${user.id}
      AND "petId" = "Pet".id
    ) AS favorite,
    (
      ST_Distance(
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
    INNER JOIN "PetImage"
    ON "PetImage"."petId" = "Pet".id
    WHERE "Pet"."userId" != ${user.id}
    AND "adoptedAt" IS NULL
    AND (ST_Distance(
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
    )) <= ${filters.distance * 1000}
    ${
      filters.sex
        ? Prisma.sql`AND sex = ${filters.sex}::"PetSex"`
        : Prisma.empty
    }
    ${
      filters.type
        ? Prisma.sql`AND type = ${filters.type}::"PetType"`
        : Prisma.empty
    }
    OFFSET ${
      parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string) * filters.page
    }
    LIMIT ${parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string)}) t
    ORDER BY t."createdAt" DESC
    `

    const rowsCount = rows.length
    const totalCount = await petModel.count({
      where: {
        userId: {
          not: user.id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      payload: {
        data: rows,
        nextPage:
          totalCount <= rowsCount * (filters.page + 1)
            ? null
            : filters.page + 1,
      },
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

export async function POST(request: Request) {
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

    const formData = await request.formData()

    const body: { [key: string]: any } = {}

    for (const [key] of formData) {
      if (key.endsWith('s')) {
        body[key] = formData.getAll(key) ?? []
      } else {
        body[key] = formData.get(key)
      }
    }

    const response = createPetSchema.safeParse(body)

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

    await prismaClient.$transaction(async (tx) => {
      const pet = await tx.pet.create({
        data: {
          userId: user.id,
          name: data.name,
          sex: data.sex,
          type: data.type,
          description: data.description,
        },
      })

      await tx.pet.update({
        where: {
          id: pet.id,
        },
        data: {
          images: {
            createMany: {
              data: await Promise.all(
                data.images.map(async (blobImage) => {
                  const response = await put(`pet/${pet.id}.jpg`, blobImage, {
                    access: 'public',
                    addRandomSuffix: true,
                  })

                  return { path: response.url }
                }),
              ),
            },
          },
        },
      })
    })

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
