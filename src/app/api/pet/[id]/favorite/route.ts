import { authOptions } from '@/authOptions'
import { petModel } from '@/models/pet'
import { petFavoriteModel } from '@/models/petFavorite'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(_: Request, { params }: { params: { id: string } }) {
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
          payload: {
            message: 'Pet não encontrado.',
          },
        },
        { status: 404 },
      )
    }

    if (pet.userId === user.id) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Você não pode adicionar seu próprio pet aos favoritos.',
          },
        },
        { status: 400 },
      )
    }

    const favorite = await petFavoriteModel.findFirst({
      where: {
        petId: pet.id,
        userId: user.id,
      },
    })

    if (favorite) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'O pet já está adicionado aos seus favoritos.',
          },
        },
        { status: 400 },
      )
    }

    await petFavoriteModel.create({
      data: {
        petId: pet.id,
        userId: user.id,
      },
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
          payload: {
            message: 'Pet não encontrado.',
          },
        },
        { status: 404 },
      )
    }

    if (pet.userId === user.id) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Você não pode adicionar seu próprio pet aos favoritos.',
          },
        },
        { status: 400 },
      )
    }

    const favorite = await petFavoriteModel.findFirst({
      where: {
        petId: pet.id,
        userId: user.id,
      },
    })

    if (!favorite) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'O pet não está adicionado aos seus favoritos.',
          },
        },
        { status: 400 },
      )
    }

    await petFavoriteModel.delete({
      where: {
        id: favorite.id,
      },
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
