'use client'

import { nameToInitials } from '@/utils/nameToInitials'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Link from 'next/link'

type Props = {
  petId: string
  petImageUrl: string
  petName: string
  userName: string
}

export function ChatHeaderComponent({
  petId,
  petImageUrl,
  petName,
  userName,
}: Props) {
  return (
    <div className="w-full py-4 px-6 flex items-center border-b border-input">
      <Avatar>
        <AvatarImage src={petImageUrl} alt={petName} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {nameToInitials(userName ?? '')}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col justify-center gap-1 ml-2">
        <Link className="cursor-pointer" href={`/pets/${petId}`}>
          <span className="font-bold">{petName}</span>
        </Link>
        <span>{userName}</span>
      </div>
    </div>
  )
}
