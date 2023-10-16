import { nodemailerClient } from '@/libs/nodemailer'
import { recoveryPasswordTokenModel } from '@/models/recoveryPasswordToken'
import { createRecoveryPasswordToken } from '@/schemas/createRecoveryPasswordToken'
import { addMinutes } from 'date-fns'
import { readFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import { resolve } from 'path'
import ejs from 'ejs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = createRecoveryPasswordToken.safeParse(body)

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

    const recoveryPasswordToken = await recoveryPasswordTokenModel.create({
      data: {
        email: data.email,
        expireAt: addMinutes(
          new Date(),
          parseInt(
            process.env.PASSWORD_RECOVERY_TOKEN_EXPIRATION_TIME as string,
          ),
        ),
      },
    })

    if (!recoveryPasswordToken) {
      throw new Error('Failed to create recovery token.')
    }

    const templatesDir = resolve(process.cwd(), 'src/templates/mails')
    const templateContent = await readFile(
      templatesDir + '/recovery-password.ejs',
      'utf8',
    )
    const result = ejs.render(templateContent, {
      logo: `${process.env.NEXTAUTH_URL}/assets/icons/icon-72x72.png`,
      url: `${process.env.NEXTAUTH_URL}/atualizar-senha/${recoveryPasswordToken.token}`,
    })

    await new Promise<void>((resolve, reject) =>
      nodemailerClient.sendMail(
        {
          to: recoveryPasswordToken.email,
          subject: 'Minhau - Alteração de senha',
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
