import { authOptions } from '@/authOptions'
import { prismaClient } from '@/libs/prisma'
import { redisClient } from '@/libs/redis'
import { chatModel } from '@/models/chat'
import { petModel } from '@/models/pet'
import { userModel } from '@/models/user'
import { initializeChatSchema } from '@/schemas/initializeChat'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    const body = await request.json()

    const response = initializeChatSchema.safeParse(body)

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

    const pet = await petModel.findUnique({
      where: {
        id: data.petId,
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

    if (pet.id === user.id) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Você não pode iniciar conversa com seu pet.',
          },
        },
        { status: 400 },
      )
    }

    const hasChat = await chatModel.count({
      where: {
        petId: pet.id,
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
    })

    if (hasChat) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Você já possui uma conversa com esse pet!',
          },
        },
        { status: 404 },
      )
    }

    const chat = await chatModel.create({
      data: {
        user1Id: pet.userId,
        user2Id: user.id,
        petId: pet.id,
        messages: {
          create: {
            senderId: user.id,
            content: data.content,
          },
        },
      },
      include: {
        messages: {
          select: {
            senderId: true,
            content: true,
            createdAt: true,
          },
          take: 1,
        },
      },
    })

    const owner = await userModel.findUnique({ where: { id: pet.userId } })

    if (!owner) {
      throw new Error('Failed to find pet owner.')
    }

    const [newChatMessagePayload] = await prismaClient.$queryRaw<
      {
        id: string
        user1Id: string
        user2Id: string
        pet: {
          name: string
          image: {
            id: string
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
    SELECT "Chat".id, "user1Id", "user2Id", 
    json_build_object('name', "Pet".name, 'image', json_build_object('id', "Pet"."imageId", 'path', "Pet"."imagePath")) AS pet,
    json_build_object('content', "ChatMessage".content, 'createdAt', "ChatMessage"."createdAt", 'senderId', "ChatMessage"."senderId", 'viewedAt', "ChatMessage"."viewedAt") AS message
    FROM "Chat"
    INNER JOIN (
      SELECT "Pet".id, name, "PetImage".id AS "imageId", "PetImage"."path" AS "imagePath"
      FROM "Pet"
      INNER JOIN (
        SELECT "PetImage".id, "PetImage".path, "PetImage"."petId"
        FROM "PetImage"
        ORDER BY "createdAt" DESC
        LIMIT 1
      ) AS "PetImage"
      ON "Pet".id = "PetImage"."petId"
      LIMIT 1
    ) AS "Pet"
    ON "Pet".id = "Chat"."petId"
    INNER JOIN "ChatMessage"
    ON "ChatMessage"."chatId" = "Chat".id
    WHERE "Chat".id = ${chat.id}`

    if (!redisClient.isOpen) await redisClient.connect()

    await redisClient.publish('new-chat', JSON.stringify(newChatMessagePayload))

    return NextResponse.json({
      success: true,
      payload: chat.id,
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
