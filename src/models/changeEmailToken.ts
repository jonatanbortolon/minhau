import { prismaClient } from '@/libs/prisma'

export const changeEmailTokenModel = prismaClient.changeEmailToken
