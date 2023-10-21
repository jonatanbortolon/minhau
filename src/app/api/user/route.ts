import { authOptions } from '@/authOptions'
import { userModel } from '@/models/user'
import { signupSchema } from '@/schemas/signup'
import { updateProfileSchema } from '@/schemas/updateProfile'
import { del, put } from '@vercel/blob'
import bcrypt from 'bcrypt'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = signupSchema.safeParse(body)

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

    const userCountWithEmail = await userModel.count({
      where: {
        email: data.email,
      },
    })

    if (userCountWithEmail > 0) {
      return NextResponse.json(
        {
          success: false,
          payload: {
            message: 'E-mail em uso.',
            input: 'email',
          },
        },
        { status: 409 },
      )
    }

    const user = await userModel.create({
      data: {
        name: data.name,
        email: data.email,
        password: bcrypt.hashSync(data.password, 12),
        location: {
          create: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
        },
      },
    })

    if (!user) {
      throw new Error('Failed to create user.')
    }

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

    const formData = await request.formData()

    const body: { [key: string]: any } = {}

    for (const [key] of formData) {
      body[key] = formData.get(key)
    }

    const response = updateProfileSchema.safeParse(body)

    if (!response.success) {
      const error = response.error.issues[0]
      console.log(error)

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

    let imageUrl: string | null = null

    if (data.image) {
      if (user.image) await del(`user/${user.id}.jpg`)

      const imageResponse = await put(`user/${user.id}.jpg`, data.image, {
        access: 'public',
      })

      imageUrl = imageResponse.url
    }

    await userModel.update({
      where: {
        id: user.id,
      },
      data: {
        image: imageUrl || undefined,
        name: data.name,
        location: {
          update: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
        },
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

export async function DELETE() {
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

    await userModel.delete({
      where: {
        id: user.id,
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
