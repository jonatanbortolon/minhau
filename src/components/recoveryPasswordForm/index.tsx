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
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { getApiUrl } from '@/utils/getApiUrl'
import { ApiResponse } from '@/types/apiResponse'
import { createRecoveryPasswordToken } from '@/schemas/createRecoveryPasswordToken'
import Link from 'next/link'

export function RecoveryPasswordFormComponent() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof createRecoveryPasswordToken>>({
    resolver: zodResolver(createRecoveryPasswordToken),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      const response: ApiResponse = await fetch(
        `${getApiUrl()}/auth/password/recovery`,
        {
          method: 'POST',
          body: JSON.stringify({
            email,
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

        return form.setError(response.payload.input as 'email', {
          message: response.payload.message,
        })
      }

      toast({
        title: 'E-mail enviado.',
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
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Enviar e-mail
          <Loader2Icon
            className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
            data-show={form.formState.isSubmitting}
          />
        </Button>
        <div className="w-full flex justify-center">
          <Link className="text-muted-foreground text-sm" href="/entrar">
            Voltar
          </Link>
        </div>
      </form>
    </Form>
  )
}
