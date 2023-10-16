import { authOptions } from '@/authOptions'
import { prismaClient } from '@/libs/prisma'
import { chatModel } from '@/models/chat'
import { getFilters } from '@/utils/getFilters'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import z from 'zod'

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

    const rawFilters = getFilters(request.url, [
      'name',
      'adopted',
      'sex',
      'type',
      'distance',
    ])

    const response = z
      .object({
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
        user1Id: string
        user2Id: string
        pet: {
          name: string
          image: {
            path: string
          }
        }
        message: {
          senderId: string
          content: string
          createdAt: Date
          viewedAt: Date | null
        }
      }[]
    >`
    SELECT * FROM (SELECT DISTINCT ON ("Chat".id) "Chat".id, "user1Id", "user2Id",
    json_build_object('name', "Pet".name, 'image', json_build_object('id', "PetImage".id, 'path', "PetImage".path)) AS pet,
    json_build_object('content', "ChatMessage".content, 'createdAt', "ChatMessage"."createdAt", 'senderId', "ChatMessage"."senderId", 'viewedAt', "ChatMessage"."viewedAt") AS message
    FROM "Chat"
    INNER JOIN "Pet"
    ON "Pet".id = "Chat"."petId"
    INNER JOIN "PetImage"
    ON "PetImage"."petId" = "Chat"."petId"
    INNER JOIN "ChatMessage"
    ON "ChatMessage"."chatId" = "Chat".id
    WHERE "user2Id" = ${user.id}
    LIMIT ${parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string)}
    OFFSET ${
      parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string) * filters.page
    }) t
    ORDER BY t.message->>'createdAt'`
    const rowsCount = rows.length
    const totalCount = await chatModel.count({
      where: {
        user2Id: user.id,
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
