import { z } from 'zod'
import { PetType, PetSex } from '@prisma/client'
import { PetAdopted } from '@/enums/petAdopted'

export const filtersSchema = z.object({
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
})
