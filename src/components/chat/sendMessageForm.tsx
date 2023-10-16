import { SendHorizonal, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { FormField, FormItem, FormControl, Form } from '../ui/form'
import { sendMessageSchema } from '@/schemas/sendMessage'
import { getApiUrl } from '@/utils/getApiUrl'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '../ui/use-toast'
import { ChangeEvent } from 'react'
import { TextareaAutosizeInputComponent } from '../textareaAutosizeInput'
import { ApiResponse } from '@/types/apiResponse'

type Props = {
  chatId: string
  onSent: (message: {
    id: string
    content: string
    senderId: string
    createdAt: string
    viewedAt: string | null
  }) => void
}

export function SendMessageFormComponent({ chatId, onSent }: Props) {
  const form = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = form.handleSubmit(async ({ content }) => {
    try {
      const response: ApiResponse<{
        id: string
        content: string
        senderId: string
        createdAt: string
        viewedAt: string | null
      }> = await fetch(`${getApiUrl()}/chat/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({
          content,
        }),
      }).then((res) => res.json())

      if (!response.success) {
        if (!response.payload.input) {
          return toast({
            variant: 'destructive',
            title: 'Ops, algo deu errado!',
            description:
              'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
          })
        }

        return form.setError(response.payload.input as 'content', {
          message: response.payload.message,
        })
      }

      onSent(response.payload)

      form.setValue('content', '')
    } catch (error) {
      console.log(error)

      return toast({
        variant: 'destructive',
        title: 'Ops, algo deu errado!',
        description:
          'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
      })
    }
  })

  function onMessageChange(
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void,
  ) {
    return (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value
        .replace(/  +/g, ' ')
        .replace(/(\r\n|\r|\n){2,}/g, '$1')

      if (
        value.length <=
        parseInt(process.env.NEXT_PUBLIC_PET_DESCRIPTION_MAX_LENGTH as string)
      ) {
        event.target.value = value

        onChange(event)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="w-full flex gap-2 items-end justify-end p-6 border-t border-input">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <TextareaAutosizeInputComponent
                    minRows={1}
                    maxRows={6}
                    {...field}
                    onChange={onMessageChange(field.onChange)}
                    placeholder="Envie uma mensagem..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            <SendHorizonal
              className="data-[show=true]:hidden"
              data-show={form.formState.isSubmitting}
            />
            <Loader2Icon
              className="h-4 w-4 animate-spin hidden data-[show=true]:inline"
              data-show={form.formState.isSubmitting}
            />
          </Button>
        </div>
      </form>
    </Form>
  )
}
