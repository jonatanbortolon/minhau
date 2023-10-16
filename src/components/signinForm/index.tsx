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
import { useRouter } from 'next/navigation'
import { signinSchema } from '@/schemas/signin'
import { signIn } from 'next-auth/react'
import { ErrorApiResponse } from '@/types/ErrorApiResponse'
import Link from 'next/link'
import { PasswordInputComponent } from '../passwordInput'
import { Separator } from '../ui/separator'
import Image from 'next/image'

export function SigninFormComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    try {
      const signinResponse = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signinResponse && !signinResponse.ok) {
        const response: ErrorApiResponse = JSON.parse(
          signinResponse.error || '',
        )

        if (!response.payload.input) {
          return toast({
            variant: 'destructive',
            title: 'Ops, algo deu errado!',
            description:
              'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
          })
        }

        return form.setError(response.payload.input as 'email' | 'password', {
          message: response.payload.message,
        })
      }

      router.push('/pets')
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

  async function onGoogleSigninClick() {
    try {
      const signinResponse = await signIn('google', {
        redirect: false,
      })

      if (signinResponse && !signinResponse.ok) {
        return toast({
          variant: 'destructive',
          title: 'Ops, algo deu errado!',
          description:
            'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
        })
      }

      router.push('/pets')
    } catch (error) {
      console.log(error)

      return toast({
        variant: 'destructive',
        title: 'Ops, algo deu errado!',
        description:
          'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
      })
    }
  }

  async function onFacebookSigninClick() {
    try {
      const signinResponse = await signIn('facebook', {
        redirect: false,
      })

      if (signinResponse && !signinResponse.ok) {
        return toast({
          variant: 'destructive',
          title: 'Ops, algo deu errado!',
          description:
            'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
        })
      }

      router.push('/pets')
    } catch (error) {
      console.log(error)

      return toast({
        variant: 'destructive',
        title: 'Ops, algo deu errado!',
        description:
          'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
      })
    }
  }

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-2">
        <Button className="justify-start" onClick={onGoogleSigninClick}>
          <Image
            className="mr-4 dark:brightness-0 dark:saturate-100 dark:invert-[6%] dark:sepia-[16%] dark:hue-rotate-[187deg] dark:contrast-[105%]"
            src="/assets/images/google-logo.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          Entre com o Google
        </Button>
        <Button className="justify-start" onClick={onFacebookSigninClick}>
          <Image
            className="mr-4 dark:brightness-0 dark:saturate-100 dark:invert-[6%] dark:sepia-[16%] dark:hue-rotate-[187deg] dark:contrast-[105%]"
            src="/assets/images/facebook-logo.svg"
            alt="Facebook logo"
            width={20}
            height={20}
          />
          Entre com o Facebook
        </Button>
      </div>
      <div className="w-full relative my-10">
        <Separator className="" />
        <span className="absolute left-1/2 top-1/2 text-muted-foreground text-xs -translate-x-1/2 -translate-y-1/2 bg-background px-2">
          Ou
        </span>
      </div>
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
          <div className="w-full flex justify-end">
            <Link
              className="text-muted-foreground text-sm"
              href="/recuperar-senha"
            >
              Esqueci minha senha!
            </Link>
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Entrar
            <Loader2Icon
              className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
              data-show={form.formState.isSubmitting}
            />
          </Button>
          <div className="w-full flex justify-center">
            <Link
              className="text-muted-foreground text-sm text-center"
              href="/cadastrar"
            >
              Ainda não possui um cadastro?
              <br />
              Crie agora!
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
