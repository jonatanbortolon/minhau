import { userModel } from '@/models/user'
import { isAfter } from 'date-fns'
import { NextResponse } from 'next/server'
import { changeEmailTokenModel } from '@/models/changeEmailToken'
import { updateEmailWithToken } from '@/schemas/updateEmailWithToken '

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const response = updateEmailWithToken.safeParse(body)

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

    const changeEmailToken = await changeEmailTokenModel.findUnique({
      where: {
        token: data.token,
      },
    })

    if (!changeEmailToken) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Token não encontrado.',
            input: 'token',
          },
        },
        { status: 400 },
      )
    }

    if (changeEmailToken.usedAt) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Esse token já foi usado.',
            input: 'token',
          },
        },
        { status: 400 },
      )
    }

    if (isAfter(new Date(), changeEmailToken.expireAt)) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'Token expirado.',
            input: 'token',
          },
        },
        { status: 400 },
      )
    }

    await userModel.update({
      where: {
        id: changeEmailToken.userId,
      },
      data: {
        email: changeEmailToken.newEmail,
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
