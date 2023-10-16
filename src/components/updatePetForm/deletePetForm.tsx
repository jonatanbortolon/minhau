'use client'

import 'leaflet/dist/leaflet.css'
import { useForm } from 'react-hook-form'
import { Form } from '../ui/form'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { getApiUrl } from '@/utils/getApiUrl'

type Props = {
  id: string
}

export function DeletePetFormComponent({ id }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm()

  const onSubmit = form.handleSubmit(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/pet/${id}`, {
        method: 'DELETE',
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

        return form.setError(response.payload.input, {
          message: response.payload.message,
        })
      }

      router.back()
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

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="mt-2 grid">
        <Button
          type="submit"
          variant="destructive"
          disabled={form.formState.isSubmitting}
        >
          Remover pet
          <Loader2Icon
            className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
            data-show={form.formState.isSubmitting}
          />
        </Button>
      </form>
    </Form>
  )
}
