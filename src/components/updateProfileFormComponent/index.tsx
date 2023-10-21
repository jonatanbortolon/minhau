'use client'

import { cn } from '@/libs/utils'
import { updateProfileSchema } from '@/schemas/updateProfile'
import { ApiResponse } from '@/types/apiResponse'
import { blobToBase64 } from '@/utils/blobToBase64'
import { getApiUrl } from '@/utils/getApiUrl'
import { nameToInitials } from '@/utils/nameToInitials'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { LocationInputComponent } from '../locationInput'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { useToast } from '../ui/use-toast'

type Props = {
  initialLocation: {
    latitude: number
    longitude: number
  }
}

export function UpdateProfileFormComponent({ initialLocation }: Props) {
  const { data: session, update: updateSession } = useSession()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      image: null,
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
    },
  })
  const image = form.watch('image')
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    form.setValue('name', session.user.name ?? '')
  }, [session])

  useEffect(() => {
    if (!image) return

    async function loadImage(image: Blob) {
      const base64 = await blobToBase64(image)

      setImageBase64(base64)
    }

    loadImage(image)
  }, [image])

  const onSubmit = form.handleSubmit(
    async ({ image, name, latitude, longitude }) => {
      try {
        const formData = new FormData()

        if (image) formData.append('image', image)
        formData.append('name', name)
        formData.append('latitude', latitude.toString())
        formData.append('longitude', longitude.toString())

        const response: ApiResponse<{
          image: string | null
          name: string | null
          location: {
            latitude: number
            longitude: number
          } | null
        }> = await fetch(`${getApiUrl()}/user`, {
          method: 'PUT',
          body: formData,
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
              | 'image'
              | 'latitude'
              | 'longitude'
              | 'name',
            {
              message: response.payload.message,
            },
          )
        }

        await updateSession()

        form.reset({
          latitude: form.getValues('latitude'),
          longitude: form.getValues('longitude'),
        })

        toast({
          title: 'Informações pessoais atualizadas.',
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
    },
  )

  return (
    <div className="w-full flex flex-col">
      <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
        Informações pessoais
      </h2>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid space-y-3">
          <FormField
            control={form.control}
            name="image"
            render={({ fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Imagem</FormLabel>
                <FormControl>
                  <>
                    <div
                      className={cn(
                        'grid place-items-center space-y-4 rounded-md border border-input p-6',
                        error && 'border-destructive',
                      )}
                    >
                      <Avatar className="relative w-20 h-20 cursor-pointer">
                        <AvatarImage
                          src={
                            imageBase64 ?? (session?.user.image || undefined)
                          }
                          alt={session?.user.name ?? ''}
                        />
                        <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                          {nameToInitials(session?.user.name ?? '')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {error ? (
                      <span className="text-sm font-medium text-destructive">
                        {error.message}
                      </span>
                    ) : null}
                    <Button className="w-full" asChild>
                      <label>
                        <input
                          className="sr-only"
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            form.setValue(
                              'image',
                              event.target.files?.item(0) ?? null,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              },
                            )
                          }
                        />
                        Adicionar foto
                      </label>
                    </Button>
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormItem>
            <FormLabel
              className={
                form.formState.errors.latitude ||
                form.formState.errors.longitude
                  ? 'text-destructive'
                  : undefined
              }
            >
              Endereço
            </FormLabel>
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
            {form.formState.errors.latitude ||
            form.formState.errors.longitude ? (
              <span className="text-sm font-medium text-destructive">
                Localização inválida.
              </span>
            ) : null}
            <FormDescription>
              Você pode escolher o endereço pela barra de pesquisa ou arrastando
              o mapa.
              <br />
              Não se preocupe em ser exato, o local é usado somente para
              calcular a distancia dos pets até você.
            </FormDescription>
          </FormItem>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            Atualizar informações pessoais
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
