'use client'

import 'leaflet/dist/leaflet.css'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { getApiUrl } from '@/utils/getApiUrl'
import { ApiResponse } from '@/types/apiResponse'
import { updatePassword } from '@/schemas/updatePassword'
import { PasswordInputComponent } from '../passwordInput'

export function UpdatePasswordComponent() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof updatePassword>>({
    resolver: zodResolver(updatePassword),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      const response: ApiResponse = await fetch(
        `${getApiUrl()}/auth/password`,
        {
          method: 'PUT',
          body: JSON.stringify({
            password,
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

        return form.setError(response.payload.input as 'password', {
          message: response.payload.message,
        })
      }

      toast({
        title: 'Senha alterada.',
        className: 'bg-green-500 dark:bg-green-800',
      })
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
    <div className="w-full flex flex-col">
      <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
        Senha
      </h2>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid space-y-3">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInputComponent {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            Atualizar senha
            <Loader2Icon
              className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
              data-show={form.formState.isSubmitting}
            />
          </Button>
        </form>
      </Form>
    </div>
  )
}
