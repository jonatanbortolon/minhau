import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prismaClient } from './libs/prisma'
import bcrypt from 'bcrypt'
import { userModel } from '@/models/user'
import { omit } from 'lodash'

export const authOptions: AuthOptions = {
  pages: {
    error: '/entrar',
    signIn: '/entrar',
  },
  adapter: PrismaAdapter(prismaClient),
  callbacks: {
    session: async ({ session, token }) => {
      if (!session.user.email) throw new Error('Failed to fetch user data.')

      const userDatabase = await userModel.findUnique({
        where: { id: token.sub },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      })

      if (!userDatabase) throw new Error('Failed to fetch user data.')

      session.user = userDatabase

      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID as string,
      clientSecret: process.env.FACEBOOK_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email = null, password = null } = credentials ?? {
          email: null,
          password: null,
        }

        if (!email) {
          throw new Error(
            JSON.stringify({
              success: false,
              payload: {
                message: 'O e-mail é obrigatório.',
                input: 'email',
              },
            }),
          )
        }

        if (!password) {
          throw new Error(
            JSON.stringify({
              success: false,
              payload: {
                message: 'A senha é obrigatória.',
                input: 'password',
              },
            }),
          )
        }

        const user = await userModel.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
          },
        })

        if (!user) {
          throw new Error(
            JSON.stringify({
              success: false,
              payload: {
                message: 'E-mail não encontrado.',
                input: 'email',
              },
            }),
          )
        }

        if (!user.password) {
          throw new Error(
            JSON.stringify({
              success: false,
              payload: {
                message: 'Senha não cadastrada.',
                input: 'email',
              },
            }),
          )
        }

        const isSamePassword = bcrypt.compareSync(password, user.password)

        if (!isSamePassword) {
          throw new Error(
            JSON.stringify({
              success: false,
              payload: {
                message: 'Senha incorreta.',
                input: 'password',
              },
            }),
          )
        }

        return omit(user, ['password'])
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
}
