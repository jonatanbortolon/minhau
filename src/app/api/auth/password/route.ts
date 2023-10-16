import { authOptions } from '@/authOptions'
import { userModel } from '@/models/user'
import { updatePassword } from '@/schemas/updatePassword'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
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

    const response = updatePassword.safeParse(body)

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

    await userModel.update({
      where: {
        id: user.id,
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
