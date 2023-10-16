import z from 'zod'

export const createLocationSchema = z.object({
  latitude: z.coerce
    .number({
      required_error: 'O endereço é obrigatório.',
    })
    .min(-90)
    .max(90),
  longitude: z.coerce
    .number({
      required_error: 'O endereço é obrigatório.',
    })
    .min(-180)
    .max(180),
})
