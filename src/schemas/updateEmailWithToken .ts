import z from 'zod'

export const updateEmailWithToken = z.object({
  token: z
    .string({
      required_error: 'Token inválido.',
    })
    .uuid('Token inválido.'),
})
