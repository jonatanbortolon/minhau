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
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { getApiUrl } from '@/utils/getApiUrl'
import { LocationInputComponent } from '../locationInput'
import { ApiResponse } from '@/types/apiResponse'
import Link from 'next/link'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useEffect, useRef } from 'react'
import { createLocationSchema } from '@/schemas/createLocation'

export function PostSignupFormComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof createLocationSchema>>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
    },
  })
  const [latitude, longitude] = useGeolocation()
  const runnedOnceRef = useRef<boolean>(false)

  useEffect(() => {
    if (!latitude || !longitude) return

    if (runnedOnceRef.current) return

    runnedOnceRef.current = true

    form.setValue('latitude', latitude)
    form.setValue('longitude', longitude)
  }, [latitude, longitude])

  const onSubmit = form.handleSubmit(async ({ latitude, longitude }) => {
    try {
      const response: ApiResponse = await fetch(
        `${getApiUrl()}/user/location`,
        {
          method: 'POST',
          body: JSON.stringify({
            latitude,
            longitude,
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

        return form.setError(
          response.payload.input as 'latitude' | 'longitude',
          {
            message: response.payload.message,
          },
        )
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
      <form onSubmit={onSubmit} className="grid space-y-3">
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
                    form.setValue('latitude', value.latitude, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                    form.setValue('longitude', value.longitude, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
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
