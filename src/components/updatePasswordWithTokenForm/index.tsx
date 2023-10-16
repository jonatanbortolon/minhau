'use client'

import 'leaflet/dist/leaflet.css'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { getApiUrl } from '@/utils/getApiUrl'
import { ApiResponse } from '@/types/apiResponse'
import { updatePasswordWithTokenSchema } from '@/schemas/updatePasswordWithToken'
import { PasswordInputComponent } from '../passwordInput'
import { useRouter } from 'next/navigation'

type Props = {
  token: string
}

export function UpdatePasswordWithTokenFormComponent({ token }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof updatePasswordWithTokenSchema>>({
    resolver: zodResolver(updatePasswordWithTokenSchema),
    defaultValues: {
      token,
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async ({ password, token }) => {
    try {
      const response: ApiResponse = await fetch(
        `${getApiUrl()}/auth/password/token`,
        {
          method: 'PUT',
          body: JSON.stringify({
            password,
            token,
          }),
        },
      ).then((res) => res.json())

      if (!response.success) {
        if (!response.payload.input) {
          return toast({
            variant: 'destructive',
            title: 'Ops, algo deu errado!',
            description:
              'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
          })
        }

        if (response.payload.input === 'token') {
          return toast({
            variant: 'destructive',
            title: response.payload.message,
          })
        }

        return form.setError(response.payload.input as 'password', {
          message: response.payload.message,
        })
      }

      router.push('/entrar')
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
      <form onSubmit={onSubmit} className="grid space-y-3">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <PasswordInputComponent {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Atualizar senha
          <Loader2Icon
            className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
            data-show={form.formState.isSubmitting}
          />
        </Button>
      </form>
    </Form>
  )
}
