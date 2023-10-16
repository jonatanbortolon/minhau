import { initializeChatSchema } from '@/schemas/initializeChat'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { Button } from '../ui/button'
import { Loader2Icon, SendHorizonal } from 'lucide-react'
import { getApiUrl } from '@/utils/getApiUrl'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { ChangeEvent } from 'react'
import { TextareaAutosizeInputComponent } from '../textareaAutosizeInput'
import { ApiResponse } from '@/types/apiResponse'

type Props = {
  petId: string
  onSent: (chatId: string) => void
}

export function InitializeChatFormComponent({ petId, onSent }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof initializeChatSchema>>({
    resolver: zodResolver(initializeChatSchema),
    defaultValues: {
      petId,
      content: '',
    },
  })

  const onSubmit = form.handleSubmit(async ({ petId, content }) => {
    try {
      const response: ApiResponse<{
        id: string
        user1Id: string
        user2Id: string
        pet: {
          name: string
          image: {
            id: string
            path: string
          }
        }[]
        message: {
          senderId: string
          content: string
          createdAt: string
        }[]
      }> = await fetch(`${getApiUrl()}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          petId,
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

        return form.setError(response.payload.input as 'petId' | 'content', {
          message: response.payload.message,
        })
      }

      onSent(response.payload.id)

      router.push(`/conversas/${response.payload}`)
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
        <div className="w-full flex gap-2 items-end">
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
          <Button disabled={form.formState.isSubmitting}>
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
