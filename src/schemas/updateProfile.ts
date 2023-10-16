import { z } from 'zod'
import { createLocationSchema } from './createLocation'

const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg']

export const updateProfileSchema = createLocationSchema.merge(
  z.object({
    name: z
      .string({
        required_error: 'O nome do pet é obrigatório.',
      })
      .min(3, {
        message: 'O nome do pet precisa ter 3 caracteres ou mais.',
      }),
    image: z
      .instanceof(Blob, {
        message: 'Imgem inválida.',
      })
      .refine((current) => current.size <= MAX_FILE_SIZE, {
        message: 'Somente permitidos arquivos menores que 5mb.',
      })
      .refine((current) => ACCEPTED_IMAGE_TYPES.includes(current.type), {
        message: 'Somente imagens são permitias.',
      })
      .nullish(),
  }),
)
