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
import { updatePetSchema } from '@/schemas/updatePet'
import { Checkbox } from '../ui/checkbox'
import { cn } from '@/libs/utils'
import { PetSex, PetType } from '@prisma/client'
import { getApiUrl } from '@/utils/getApiUrl'
import { DeletePetFormComponent } from './deletePetForm'

type Props = {
  initialData: {
    id: string
    name: string
    description: string | null
    sex: PetSex
    type: PetType
    adoptedAt: Date | null
    createdAt: Date
    distance: number
    favorite: boolean
    chatId: string | null
    images: {
      id: string
      path: string
    }[]
    owner: {
      id: string
      name: string
      image: string
    }
  }
}

export function UpdatePetFormComponent({ initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof updatePetSchema>>({
    resolver: zodResolver(updatePetSchema),
    defaultValues: {
      addedImages: [],
      deletedImages: [],
      description: initialData.description ?? undefined,
      name: initialData.name,
      isAdopted: !!initialData.adoptedAt,
      sex: initialData.sex,
      type: initialData.type,
    },
  })
  const images = initialData.images.filter(
    (image) => !form.watch('deletedImages').includes(image.id),
  )
  const addedImages = form.watch('addedImages')
  const [filesRender, setFilesRender] = useState<Array<string>>([])

  const imagesError =
    form.formState.errors.addedImages?.message ??
    form.formState.errors.deletedImages?.message ??
    null

  useEffect(() => {
    Promise.all(addedImages.map(blobToBase64)).then(setFilesRender)
  }, [addedImages])

  const onSubmit = form.handleSubmit(
    async ({
      addedImages,
      deletedImages,
      name,
      description,
      sex,
      type,
      isAdopted,
    }) => {
      try {
        const formData = new FormData()

        for (const image of addedImages) formData.append('addedImages', image)
        for (const image of deletedImages)
          formData.append('deletedImages', image)
        formData.append('name', name)
        formData.append('description', description)
        formData.append('sex', sex)
        formData.append('type', type)
        formData.append('isAdopted', String(isAdopted))

        const response = await fetch(`${getApiUrl()}/pet/${initialData.id}`, {
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

  function onRemoveAddedImageByIndexClick(index: number) {
    const newImages = produce(form.getValues('addedImages'), (state) => {
      state.splice(index, 1)
    })

    form.setValue('addedImages', newImages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  function onRemoveImageByIndexClick(id: string) {
    form.setValue('deletedImages', [...form.getValues('deletedImages'), id], {
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
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid space-y-3">
          <FormField
            control={form.control}
            name="addedImages"
            render={() => (
              <FormItem>
                <FormControl>
                  <>
                    <div
                      className={cn(
                        'max-w-full h-36 rounded-sm border border-input p-6 overflow-x-auto',
                        imagesError && 'border-destructive',
                      )}
                    >
                      <div className="h-full flex space-x-7">
                        {images.map((file) => {
                          return (
                            <div
                              key={`file-${file.id}`}
                              className="relative h-full aspect-square rounded-sm border border-input"
                            >
                              <Image
                                className="h-full rounded-sm aspect-square"
                                alt=""
                                src={file.path}
                                width={200}
                                height={200}
                              />
                              <Button
                                className="absolute rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2"
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  onRemoveImageByIndexClick(file.id)
                                }
                              >
                                <XIcon />
                              </Button>
                            </div>
                          )
                        })}
                        {filesRender.map((file, index) => {
                          return (
                            <div
                              key={`file-${index}`}
                              className="relative h-full aspect-square rounded-sm border border-input"
                            >
                              <Image
                                className="h-full rounded-sm aspect-square"
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
                                onClick={() =>
                                  onRemoveAddedImageByIndexClick(index)
                                }
                              >
                                <XIcon />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {imagesError ? (
                      <span className="text-sm font-medium text-destructive">
                        {imagesError}
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
                              'addedImages',
                              [
                                ...cloneDeep(form.getValues('addedImages')),
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
                    process.env
                      .NEXT_PUBLIC_PET_DESCRIPTION_MAX_LENGTH as string,
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
                    defaultValue={field.value}
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
                    defaultValue={field.value}
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
          <FormField
            control={form.control}
            name="isAdopted"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) =>
                        form.setValue(
                          'isAdopted',
                          typeof value === 'string' ? false : value,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          },
                        )
                      }
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel>Esse pet já foi adotado?</FormLabel>
                  </div>
                </div>
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
            Editar pet
            <Loader2Icon
              className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
              data-show={form.formState.isSubmitting}
            />
          </Button>
        </form>
      </Form>
      <DeletePetFormComponent id={initialData.id} />
    </>
  )
}
