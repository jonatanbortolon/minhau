import { z } from 'zod'
import { createLocationSchema } from './createLocation'

export const signupSchema = createLocationSchema.merge(
  z.object({
    name: z
      .string({
        required_error: 'O nome é obrigatório.',
      })
      .min(7, {
        message: 'O nome precisa ter 7 caracteres ou mais.',
      }),
    email: z
      .string({
        required_error: 'O e-mail é obrigatório.',
      })
      .email('E-mail inválido'),
    password: z
      .string({
        required_error: 'A senha é obrigatório.',
      })
      .min(8, {
        message: 'A senha precisa ter 8 caracteres ou mais.',
      })
      .regex(
        /.*[A-Z].*/,
        'A senha deve possuir pelo menos uma letra maiúscula.',
      )
      .regex(
        /.*[a-z].*/,
        'A senha deve possuir pelo menos uma letra minúscula.',
      )
      .regex(/.*\d.*/, 'A senha deve possuir pelo menos um número.')
      .regex(
        /.*[`~<>?,./!@#$%^&*()\-_+="'|{}[\];:\\].*/,
        'A senha deve possuir pelo menos um caractere especial.',
      ),
  }),
)
