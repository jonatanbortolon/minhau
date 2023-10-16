'use client'

import { metersToKilometers } from '@/utils/metersToKilometers'
import { PetType, PetSex } from '@prisma/client'
import { CatIcon, DogIcon, MapPinIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '../ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { MouseEvent, useState } from 'react'
import { Button } from '../ui/button'
import { getApiUrl } from '@/utils/getApiUrl'
import { GoogleIconComponent } from '../googleIcon'
import { ApiResponse } from '@/types/apiResponse'
import { useToast } from '../ui/use-toast'

type Props = {
  pet: {
    id: string
    name: string
    description: string | null
    sex: PetSex
    type: PetType
    adoptedAt: string | null
    createdAt: string
    userId: string
    distance: number
    favorite: boolean
    image: {
      id: string
      path: string
    }
  }
}

export function ListItemComponent({ pet }: Props) {
  const { toast } = useToast()
  const [favorite, setFavorite] = useState(pet.favorite)

  async function favoriteOptimistic() {
    setFavorite((old) => !old)

    const response: ApiResponse = await fetch(
      `${getApiUrl()}/pet/${pet.id}/favorite`,
      {
        method: 'POST',
      },
    ).then((res) => res.json())

    if (!response.success) {
      setFavorite((old) => !old)

      return toast({
        variant: 'destructive',
        title: 'Ops, algo deu errado!',
        description:
          'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
      })
    }
  }

  async function unfavoriteOptimistic() {
    setFavorite((old) => !old)

    const response: ApiResponse = await fetch(
      `${getApiUrl()}/pet/${pet.id}/favorite`,
      {
        method: 'DELETE',
      },
    ).then((res) => res.json())

    if (!response.success) {
      setFavorite((old) => !old)

      return toast({
        variant: 'destructive',
        title: 'Ops, algo deu errado!',
        description:
          'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
      })
    }
  }

  function onFavoritePress(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (favorite) return unfavoriteOptimistic()

    favoriteOptimistic()
  }

  return (
    <Link className="w-full" href={`/pets/${pet.id}`}>
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="relative w-full aspect-video border-b border-input">
            <div className="absolute inset-0 rounded-lg">
              <Image
                className="rounded-lg object-contain"
                alt={pet.name}
                src={pet.image.path}
                fill
              />
            </div>
          </div>
          <div className="w-full flex flex-col space-y-3 items-start justify-start p-6">
            <div className="w-full flex flex-row items-center justify-between">
              <span className="text-lg font-semibold text-ellipsis">
                {pet.name}
              </span>
              <Button
                className="p-1"
                variant="ghost"
                type="button"
                onClick={onFavoritePress}
              >
                <GoogleIconComponent
                  className="data-[favorite=true]:text-red-500"
                  icon="favorite"
                  fill
                  data={{ 'data-favorite': favorite }}
                />
              </Button>
            </div>
            <div className="w-full h-10">
              <p className="line-clamp-2 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {pet.description}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="h-full flex items-center justify-start space-x-2">
            <Badge>
              {pet.type === PetType.CAT ? (
                <CatIcon size={16} />
              ) : (
                <DogIcon size={16} />
              )}
            </Badge>
            <Badge>{pet.sex === PetSex.FEMALE ? 'Fêmea' : 'Macho'}</Badge>
          </div>
          <div className="h-full flex items-center justify-start space-x-1">
            <MapPinIcon size={16} />{' '}
            <span>{metersToKilometers(pet.distance).toFixed(1)}km</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
