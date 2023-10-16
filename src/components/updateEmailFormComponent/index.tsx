'use client'

import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { getApiUrl } from '@/utils/getApiUrl'
import { updateEmailSchema } from '@/schemas/updateEmail'
import { Input } from '../ui/input'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function UpdateEmailFormComponent() {
  const { data: session, update: updateSession } = useSession()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof updateEmailSchema>>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (!session) return

    form.setValue('email', session.user.email ?? '')
  }, [session])

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      const response = await fetch(`${getApiUrl()}/user/email`, {
        method: 'PUT',
        body: JSON.stringify({
          email,
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

        return form.setError(response.payload.input, {
          message: response.payload.message,
        })
      }

      await updateSession()

      toast({
        title: 'E-mail enviado.',
        className: 'bg-green-500 dark:bg-green-800',
      })

      form.reset({
        email,
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
        E-mail
      </h2>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            Atualizar e-mail
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
