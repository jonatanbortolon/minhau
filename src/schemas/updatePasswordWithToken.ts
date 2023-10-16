import z from 'zod'
import { updatePassword } from './updatePassword'

export const updatePasswordWithTokenSchema = updatePassword.merge(
  z.object({
    token: z
      .string({
        required_error: 'Token inválido.',
      })
      .uuid('Token inválido.'),
  }),
)
