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
import { Loader2Icon, XIcon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { createPetSchema } from '@/schemas/createPet'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '../ui/select'
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import { produce } from 'immer'
import { cloneDeep } from 'lodash'
import { blobToBase64 } from '@/utils/blobToBase64'
import { PetSex, PetType } from '@prisma/client'
import { cn } from '@/libs/utils'
import { getApiUrl } from '@/utils/getApiUrl'

export function CreatePetFormComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof createPetSchema>>({
    resolver: zodResolver(createPetSchema),
    defaultValues: {
      name: '',
      images: [],
      description: '',
      type: PetType.CAT,
      sex: PetSex.FEMALE,
    },
  })
  const images = form.watch('images')
  const [filesRender, setFilesRender] = useState<Array<string>>([])

  useEffect(() => {
    Promise.all(images.map(blobToBase64)).then(setFilesRender)
  }, [images])

  const onSubmit = form.handleSubmit(
    async ({ images, name, description, sex, type }) => {
      try {
        const formData = new FormData()

        for (const image of images) formData.append('images', image)
        formData.append('name', name)
        formData.append('description', description)
        formData.append('sex', sex)
        formData.append('type', type)

        const response = await fetch(`${getApiUrl()}/pet`, {
          method: 'POST',
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
    },
  )

  function onRemoveImageByIndexClick(index: number) {
    const newImages = produce(images, (state) => {
      state.splice(index, 1)
    })

    form.setValue('images', newImages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  function onDescriptionChange(
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
      <form onSubmit={onSubmit} className="grid space-y-3">
        <FormField
          control={form.control}
          name="images"
          render={({ field: { value }, fieldState: { error } }) => (
            <FormItem>
              <FormControl>
                <>
                  <div
                    className={cn(
                      'max-w-full h-36 rounded-sm border border-input p-6 overflow-x-auto',
                      error && 'border-destructive',
                    )}
                  >
                    <div className="h-full flex space-x-7">
                      {value && value.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">
                            Nenhuma imagem selecionada.
                          </span>
                        </div>
                      ) : null}
                      {filesRender.map((file, index) => {
                        return (
                          <div
                            key={`file-${index}`}
                            className="relative h-full aspect-square rounded-sm border border-input"
                          >
                            <Image
                              className="h-full aspect-square rounded-sm"
                              alt=""
                              src={file}
                              width={200}
                              height={200}
                            />
                            <Button
                              className="absolute rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2"
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => onRemoveImageByIndexClick(index)}
                            >
                              <XIcon />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
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
                        multiple
                        accept="image/*"
                        onChange={(event) =>
                          form.setValue(
                            'images',
                            [
                              ...cloneDeep(images),
                              ...Array.from(event.target.files ?? []),
                            ],
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          )
                        }
                      />
                      Adicionar fotos
                    </label>
                  </Button>
                </>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do pet</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Descrição <span className="text-sm italic">- Opcional</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none h-32"
                  {...field}
                  onChange={onDescriptionChange(field.onChange)}
                />
              </FormControl>
              <FormDescription className="text-right">
                {form.watch('description').length}/
                {parseInt(
                  process.env.NEXT_PUBLIC_PET_DESCRIPTION_MAX_LENGTH as string,
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do animal</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={PetType.CAT}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={PetType.CAT}>Gato</SelectItem>
                      <SelectItem value={PetType.DOG}>Cachorro</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo do animal</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={PetSex.FEMALE}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={PetSex.FEMALE}>Fêmea</SelectItem>
                      <SelectItem value={PetSex.MALE}>Macho</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={
            form.formState.isSubmitting ||
            !form.formState.isDirty ||
            !form.formState.isValid
          }
        >
          Cadastrar pet
          <Loader2Icon
            className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
            data-show={form.formState.isSubmitting}
          />
        </Button>
      </form>
    </Form>
  )
}
