'use client'

import 'leaflet/dist/leaflet.css'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
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
import { getApiUrl } from '@/utils/getApiUrl'
import { signupSchema } from '@/schemas/signup'
import { ApiResponse } from '@/types/apiResponse'
import Link from 'next/link'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { PasswordInputComponent } from '../passwordInput'

const LocationInputComponent = dynamic(
  async () =>
    import('@/components/locationInput').then((c) => c.LocationInputComponent),
  {
    ssr: false,
  },
)

export function SignupFormComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      latitude: 0,
      longitude: 0,
    },
  })
  const [latitude, longitude, error] = useGeolocation()

  useEffect(() => {
    if (!latitude || !longitude || error) return

    form.setValue('latitude', latitude)
    form.setValue('longitude', longitude)
  }, [latitude, longitude, error])

  const onSubmit = form.handleSubmit(
    async ({ name, email, password, latitude, longitude }) => {
      try {
        const response: ApiResponse = await fetch(`${getApiUrl()}/user`, {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
            latitude,
            longitude,
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

          return form.setError(
            response.payload.input as
              | 'latitude'
              | 'longitude'
              | 'name'
              | 'email'
              | 'password',
            {
              message: response.payload.message,
            },
          )
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
    },
  )

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="grid space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="latitude"
          render={() => (
            <FormItem>
              <FormLabel>Localização</FormLabel>
              <FormControl>
                <LocationInputComponent
                  value={{
                    latitude: form.watch('latitude'),
                    longitude: form.watch('longitude'),
                  }}
                  onChange={(value) => {
                    form.setValue('latitude', value.latitude)
                    form.setValue('longitude', value.longitude)
                  }}
                  error={
                    form.formState.errors.latitude?.message ||
                    form.formState.errors.longitude?.message
                  }
                />
              </FormControl>
              <FormDescription>
                Você pode escolher o endereço pela barra de pesquisa ou
                arrastando o mapa.
                <br />
                Não se preocupe em ser exato, o local é usado somente para
                calcular a distancia dos pets até você.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Cadastrar
          <Loader2Icon
            className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
            data-show={form.formState.isSubmitting}
          />
        </Button>
        <div className="w-full flex justify-center">
          <Link
            className="text-muted-foreground text-sm text-center"
            href="/entrar"
          >
            Já possui uma conta?
            <br />
            Entre agora!
          </Link>
        </div>
      </form>
    </Form>
  )
}
