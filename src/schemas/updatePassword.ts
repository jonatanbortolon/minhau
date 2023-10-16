import { z } from 'zod'

export const updatePassword = z.object({
  password: z
    .string({
      required_error: 'A senha é obrigatório.',
    })
    .min(8, {
      message: 'A senha precisa ter 8 caracteres ou mais.',
    })
    .regex(/.*[A-Z].*/, 'A senha deve possuir pelo menos uma letra maiúscula.')
    .regex(/.*[a-z].*/, 'A senha deve possuir pelo menos uma letra minúscula.')
    .regex(/.*\d.*/, 'A senha deve possuir pelo menos um número.')
    .regex(
      /.*[`~<>?,./!@#$%^&*()\-_+="'|{}[\];:\\].*/,
      'A senha deve possuir pelo menos um caractere especial.',
    ),
})
