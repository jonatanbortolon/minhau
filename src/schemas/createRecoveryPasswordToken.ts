import { z } from 'zod'

export const createRecoveryPasswordToken = z.object({
  email: z
    .string({
      required_error: 'O e-mail é obrigatório.',
    })
    .email('E-mail inválido'),
})
