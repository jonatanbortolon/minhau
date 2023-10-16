import { authOptions } from '@/authOptions'
import { nodemailerClient } from '@/libs/nodemailer'
import { changeEmailTokenModel } from '@/models/changeEmailToken'
import { updateEmailSchema } from '@/schemas/updateEmail'
import { addMinutes } from 'date-fns'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { resolve } from 'path'
import { readFile } from 'fs/promises'
import ejs from 'ejs'
import { userModel } from '@/models/user'

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

    const response = updateEmailSchema.safeParse(body)

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

    const userWithEmailCount = await userModel.count({
      where: {
        email: data.email,
      },
    })

    if (userWithEmailCount > 0) {
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

    const changeEmailToken = await changeEmailTokenModel.create({
      data: {
        userId: user.id,
        newEmail: data.email,
        expireAt: addMinutes(
          new Date(),
          parseInt(
            process.env.PASSWORD_RECOVERY_TOKEN_EXPIRATION_TIME as string,
          ),
        ),
      },
    })

    if (!changeEmailToken) {
      throw new Error('Failed to change email token.')
    }

    const templatesDir = resolve(process.cwd(), 'src/templates/mails')
    const templateContent = await readFile(
      templatesDir + '/change-email.ejs',
      'utf8',
    )
    const result = ejs.render(templateContent, {
      logo: `${process.env.NEXTAUTH_URL}/assets/icons/icon-72x72.png`,
      url: `${process.env.NEXTAUTH_URL}/atualizar-email/${changeEmailToken.token}`,
    })

    await new Promise<void>((resolve, reject) =>
      nodemailerClient.sendMail(
        {
          to: changeEmailToken.newEmail,
          subject: 'Minhau - Alteração de email',
          from: process.env.MAIL_FROM,
          html: result,
        },
        (error) => {
          if (error) return reject(error)

          resolve()
        },
      ),
    )

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
