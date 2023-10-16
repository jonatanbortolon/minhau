import { authOptions } from '@/authOptions'
import { redisClient } from '@/libs/redis'
import { chatModel } from '@/models/chat'
import { chatMessageModel } from '@/models/chatMessage'
import { sendMessageSchema } from '@/schemas/sendMessage'
import { getFilters } from '@/utils/getFilters'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import z from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(
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

    const chat = await chatModel.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!chat) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Chat não encontrado.',
          },
        },
        { status: 404 },
      )
    }

    const rows = await chatMessageModel.findMany({
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        viewedAt: true,
      },
      where: {
        chatId: chat.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip:
        parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string) *
        filters.page,
      take: parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string),
    })
    const rowsCount = rows.length
    const totalCount = await chatMessageModel.count({
      where: {
        chatId: chat.id,
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

export async function POST(
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

    const body = await request.json()
    const response = sendMessageSchema.safeParse(body)

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

    const chat = await chatModel.findUnique({
      where: {
        id: params.id,
      },
      include: {
        pet: true,
      },
    })

    if (!chat || (chat.user1Id !== user.id && chat.user2Id !== user.id)) {
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
    }

    const message = await chatMessageModel.create({
      data: {
        chatId: chat.id,
        senderId: user.id,
        content: data.content,
      },
      select: {
        id: true,
        senderId: true,
        createdAt: true,
        content: true,
        viewedAt: true,
      },
    })

    if (!redisClient.isOpen) await redisClient.connect()

    await redisClient.publish(
      'chat',
      JSON.stringify({
        message,
        receiverId: user.id === chat.user1Id ? chat.user2Id : chat.user1Id,
        chatId: chat.id,
        userName: user.name,
        petName: chat.pet.name,
      }),
    )

    return NextResponse.json({
      success: true,
      payload: message,
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
