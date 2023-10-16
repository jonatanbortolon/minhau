import { PetAdopted } from '@/enums/petAdopted'
import { authOptions } from '@/authOptions'
import { prismaClient } from '@/libs/prisma'
import { petModel } from '@/models/pet'
import { getFilters } from '@/utils/getFilters'
import { PetType, PetSex, Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import z from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    const rawFilters = getFilters(request.url)

    const response = z
      .object({
        name: z.string().nullable().default(null),
        type: z.nativeEnum(PetType).nullable().default(null),
        sex: z.nativeEnum(PetSex).nullable().default(null),
        distance: z
          .number({
            required_error: 'A distancia é obrigatória.',
          })
          .min(1, {
            message: 'A distancia tem que ser maior que 1km.',
          })
          .max(100, {
            message: 'A distancia tem que ser menor que 100km.',
          }),
        adopted: z.nativeEnum(PetAdopted).nullable().default(null),
        page: z
          .number({
            required_error: 'A página é obrigatoria.',
          })
          .int({
            message: 'A página tem que ser um numero inteiro.',
          })
          .min(0, {
            message: 'A página mínima tem que ser maior ou igual a 0.',
          }),
      })
      .safeParse(rawFilters)

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

    const filters = response.data

    const rows = await prismaClient.$queryRaw<
      {
        id: string
        name: string
        description: string | null
        sex: PetSex
        type: PetType
        adoptedAt: Date | null
        createdAt: Date
        userId: string
        distance: number
        favorite: boolean
        image: {
          id: string
          path: string
        }[]
      }[]
    >`
    SELECT * FROM (SELECT DISTINCT ON ("Pet".id)
    "Pet".id, name, description, sex, type, "adoptedAt", "Pet"."userId", "Pet"."createdAt",
    json_build_object('id', "PetImage".id, 'path', "PetImage".path) AS image,
    EXISTS (
      SELECT *
      FROM "PetFavorite"
      WHERE "userId" = ${user.id}
      AND "petId" = "Pet".id
    ) AS favorite,
    (
      ST_Distance(
        (
          SELECT ST_GeogFromText(CONCAT('SRID=4326;POINT (', latitude, ' ', longitude, ')'))
          FROM "Location"
          WHERE "Location"."userId" = "Pet"."userId"
        ),
        (
          SELECT ST_GeogFromText(CONCAT('SRID=4326;POINT (', latitude, ' ', longitude, ')'))
          FROM "Location"
          WHERE "Location"."userId" = ${user.id}
        )
      )
    ) AS distance
    FROM "Pet"
    INNER JOIN "PetImage"
    ON "PetImage"."petId" = "Pet".id
    INNER JOIN "PetFavorite" ON ("PetFavorite"."petId" = "Pet".id AND "PetFavorite"."userId" = ${
      user.id
    })
    WHERE "PetFavorite"."userId" = ${user.id}
    AND (ST_Distance(
      (
        SELECT ST_GeogFromText(CONCAT('SRID=4326;POINT (', latitude, ' ', longitude, ')'))
        FROM "Location"
        WHERE "Location"."userId" = "Pet"."userId"
      ),
      (
        SELECT ST_GeogFromText(CONCAT('SRID=4326;POINT (', latitude, ' ', longitude, ')'))
        FROM "Location"
        WHERE "Location"."userId" = ${user.id}
      )
    )) <= ${filters.distance * 1000}
    ${
      filters.adopted === null
        ? Prisma.empty
        : filters.adopted === PetAdopted.ADOPTED
        ? Prisma.sql`AND "Pet"."adoptedAt" IS NOT NULL`
        : Prisma.sql`AND "Pet"."adoptedAt" IS NULL`
    }
    ${
      filters.name === null
        ? Prisma.empty
        : Prisma.sql`AND (ts @@ to_tsquery('portuguese', ${filters.name
            .split(' ')
            .join(' & ')}) OR "Pet".name ILIKE (${`%${filters.name}%`}))`
    }
    ${
      filters.sex
        ? Prisma.sql`AND sex = ${filters.sex}::"PetSex"`
        : Prisma.empty
    }
    ${
      filters.type
        ? Prisma.sql`AND type = ${filters.type}::"PetType"`
        : Prisma.empty
    }
    OFFSET ${
      parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string) * filters.page
    }
    LIMIT ${parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string)}) t
    ORDER BY t."createdAt" DESC
    `
    const rowsCount = rows.length
    const totalCount = await petModel.count({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      payload: {
        data: rows,
        nextPage:
          totalCount <= rowsCount * (filters.page + 1)
            ? null
            : filters.page + 1,
      },
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
