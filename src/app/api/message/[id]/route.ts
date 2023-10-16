import { authOptions } from '@/authOptions'
import { redisClient } from '@/libs/redis'
import { chatModel } from '@/models/chat'
import { chatMessageModel } from '@/models/chatMessage'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(_: Request, { params }: { params: { id: string } }) {
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

    const chat = await chatModel.findFirst({
      where: {
        messages: {
          some: {
            id: params.id,
          },
        },
      },
      select: {
        user1Id: true,
        user2Id: true,
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

    const message = await chatMessageModel.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        createdAt: true,
        viewedAt: true,
      },
    })

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Mensagem não encontrada.',
          },
        },
        { status: 404 },
      )
    }

    await chatMessageModel.update({
      where: {
        id: message.id,
      },
      data: {
        viewedAt: new Date(),
      },
    })

    if (!redisClient.isOpen) await redisClient.connect()

    await redisClient.publish('message', JSON.stringify(message))

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
