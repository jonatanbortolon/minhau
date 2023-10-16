import { recoveryPasswordTokenModel } from '@/models/recoveryPasswordToken'
import { userModel } from '@/models/user'
import { isAfter } from 'date-fns'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { updatePasswordWithTokenSchema } from '@/schemas/updatePasswordWithToken'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const response = updatePasswordWithTokenSchema.safeParse(body)

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

    const recoveryPasswordToken = await recoveryPasswordTokenModel.findUnique({
      where: {
        token: data.token,
      },
    })

    if (!recoveryPasswordToken) {
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

    if (recoveryPasswordToken.usedAt) {
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

    if (isAfter(new Date(), recoveryPasswordToken.expireAt)) {
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
        email: recoveryPasswordToken.email,
      },
      data: {
        password: bcrypt.hashSync(data.password, 12),
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
