import { authOptions } from '@/authOptions'
import { prismaClient } from '@/libs/prisma'
import { userModel } from '@/models/user'
import { merge, omit } from 'lodash'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

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

    const [chat = null] = await prismaClient.$queryRaw<
      {
        id: string
        user1Id: string
        user2Id: string
        pet: {
          id: string
          name: string
          image: {
            id: string
            path: string
          }
        }
      }[]
    >`
    SELECT DISTINCT ON ("Chat".id) "Chat".id, "user1Id", "user2Id",
    json_build_object('id', "Pet".id, 'name', "Pet".name, 'image', json_build_object('id', "PetImage".id, 'path', "PetImage".path)) AS pet
    FROM "Chat"
    INNER JOIN "Pet"
    ON "Pet".id = "Chat"."petId"
    INNER JOIN "PetImage"
    ON "PetImage"."petId" = "Chat"."petId"
    WHERE "Chat".id = ${params.id} AND ("user1Id" = ${user.id} OR "user2Id" = ${user.id})`

    if (!chat) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Conversa não encontrada.',
          },
        },
        { status: 404 },
      )
    }

    const chatUser =
      chat.user1Id === user.id
        ? await userModel.findUnique({ where: { id: chat.user2Id } })
        : user

    return NextResponse.json({
      success: true,
      payload: merge(omit(chat, ['user1Id', 'user2Id']), {
        user: {
          id: chatUser?.id,
          name: chatUser?.name,
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
