import z from 'zod'

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .nonempty()
    .max(
      parseInt(
        process.env.NEXT_PUBLIC_MESSAGE_DESCRIPTION_MAX_LENGTH as string,
      ),
    )
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
    ),
})
