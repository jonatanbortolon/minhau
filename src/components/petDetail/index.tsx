'use client'

import { CarouselComponent } from '@/components/carousel'
import { metersToKilometers } from '@/utils/metersToKilometers'
import { PetType, PetSex } from '@prisma/client'
import {
  CatIcon,
  DogIcon,
  MapPinIcon,
  MessageCircleIcon,
  ShareIcon,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { InitializeChatFormComponent } from './initializeChatForm'
import Link from 'next/link'
import { useState } from 'react'
import { getApiUrl } from '@/utils/getApiUrl'
import { GoogleIconComponent } from '../googleIcon'
import { useRouter } from 'next/navigation'
import { PullToRefreshComponent } from '../pullToRefresh'
import { ApiResponse } from '@/types/apiResponse'
import { useToast } from '../ui/use-toast'
import { nameToInitials } from '@/utils/nameToInitials'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { useSession } from 'next-auth/react'

type Props = {
  pet: {
    id: string
    name: string
    description: string | null
    sex: PetSex
    type: PetType
    adoptedAt: string | null
    createdAt: string
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

export function PetDetailComponent({ pet }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()
  const [chatId, setChatId] = useState(pet.chatId)
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

    return setFavorite(true)
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

    return setFavorite(true)
  }

  function onReload() {
    router.refresh()
  }

  function onShareClick() {
    try {
      navigator.share({
        title: `Minhau - ${pet.name}`,
        url: `/pets/${pet.id}`,
      })
    } catch (error) {}
  }

  return (
    <PullToRefreshComponent
      className="w-full h-full justify-start"
      onRefresh={async () => onReload()}
    >
      <CarouselComponent images={pet.images} />
      <div className="w-full flex flex-col items-start justify-start p-6">
        <div className="w-full flex items-center justify-start">
          {pet.adoptedAt ? <Badge variant="destructive">Adotado</Badge> : null}
        </div>
        <div className="w-full flex items-center justify-between">
          <span className="text-2xl font-semibold mt-0">{pet.name}</span>
          <div className="flex gap-2 ml-auto">
            {pet.owner.id !== session?.user.id ? (
              <Button
                className="p-1"
                variant="ghost"
                size="icon"
                onClick={favorite ? unfavoriteOptimistic : favoriteOptimistic}
              >
                <GoogleIconComponent
                  className="!text-3xl data-[favorite=true]:text-red-500"
                  icon="favorite"
                  fill
                  data={{ 'data-favorite': favorite }}
                />
              </Button>
            ) : null}
            <Button
              className="p-1"
              variant="ghost"
              size="icon"
              onClick={onShareClick}
            >
              <ShareIcon className="text-3xl" />
            </Button>
          </div>
        </div>
        <div className="w-full flex flex-col mt-8">
          <span className="font-bold text-sm">Descrição</span>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2 break-words">
            {pet.description ? (
              pet.description
            ) : (
              <span className="text-lg">O pet não possui uma descrição.</span>
            )}
          </p>
        </div>
        <div className="w-full flex justify-between mt-6">
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
        </div>
        <div className="w-full flex flex-col items-start gap-3 mt-6">
          <span className="font-bold text-sm">Publicado por</span>
          <div className="h-full flex items-center justify-center space-x-1">
            <Avatar>
              <AvatarImage src={pet.owner.image} alt={pet.owner.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {nameToInitials(pet.owner.name ?? '')}
              </AvatarFallback>
            </Avatar>
            <span>{pet.owner.name}</span>
          </div>
        </div>
      </div>
      <div className="w-full p-6 mt-auto">
        {pet.owner.id !== session?.user.id ? (
          chatId ? (
            <Link className="w-full" href={`/conversas/${chatId}`}>
              <Button className="w-full">
                Ir para a conversa{' '}
                <MessageCircleIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <InitializeChatFormComponent petId={pet.id} onSent={setChatId} />
          )
        ) : (
          <Link className="w-full" href={`/pets/${pet.id}/editar`}>
            <Button className="w-full">Editar pet</Button>
          </Link>
        )}
      </div>
    </PullToRefreshComponent>
  )
}
