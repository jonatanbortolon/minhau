import { PetType, PetSex } from '@prisma/client'
import { z } from 'zod'

const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg']

export const createPetSchema = z.object({
  name: z
    .string({
      required_error: 'O nome do pet é obrigatório.',
    })
    .min(3, {
      message: 'O nome do pet precisa ter 3 caracteres ou mais.',
    }),
  description: z
    .string()
    .trim()
    .max(parseInt(process.env.NEXT_PUBLIC_PET_DESCRIPTION_MAX_LENGTH as string))
    .transform((value) =>
      value
        .replace(/  +/g, ' ')
        .replace(/(\r\n|\r|\n){2,}/g, '$1')
        .substring(
          0,
          parseInt(
            process.env.NEXT_PUBLIC_PET_DESCRIPTION_MAX_LENGTH as string,
          ),
        ),
    )
    .optional()
    .default(''),
  type: z.nativeEnum(PetType, {
    invalid_type_error: 'O tipo do pet é inválido.',
    required_error: 'O tipo do pet é obrigatório.',
  }),
  sex: z.nativeEnum(PetSex, {
    invalid_type_error: 'O sexo do pet é inválido.',
    required_error: 'O sexo do pet é obrigatório.',
  }),
  images: z
    .instanceof(Blob, {
      message: 'Imgem inválida.',
    })
    .array()
    .min(1, {
      message: 'O pet precisa de pelo menos uma foto.',
    })
    .refine((current) => current.length < 15, {
      message: 'O máximo de fotos permitidas são 15.',
    })
    .refine((current) => !current.some((file) => file.size > MAX_FILE_SIZE), {
      message: 'Somente permitidos arquivos menores que 5mb.',
    })
    .refine(
      (current) =>
        !current.some((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type)),
      { message: 'Somente imagens são permitias.' },
    ),
})
