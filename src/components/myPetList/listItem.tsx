'use client'

import { PetType, PetSex } from '@prisma/client'
import { CatIcon, DogIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '../ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '../ui/badge'

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
    image: {
      id: string
      path: string
    }
  }
}

export function ListItemComponent({ pet }: Props) {
  return (
    <Link className="w-full" href={`/pets/${pet.id}/editar`}>
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
              {pet.adoptedAt ? (
                <Badge variant="destructive">Adotado</Badge>
              ) : null}
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
        </CardFooter>
      </Card>
    </Link>
  )
}
