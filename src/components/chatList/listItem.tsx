'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthenticatedWebsocket } from '@/hooks/useAuthenticatedWebsocket'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useSocketEvent } from 'socket.io-react-hook'
import { format, isToday, isYesterday } from 'date-fns'
import { Badge } from '../ui/badge'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/libs/utils'
import { useSession } from 'next-auth/react'

type Props = {
  chat: {
    id: string
    user1Id: string
    user2Id: string
    pet: {
      name: string
      image: {
        path: string
      }
    }
    message: {
      senderId: string
      content: string
      viewedAt: string | null
      createdAt: string
    }
  }
}

export const ListItemComponent = forwardRef<
  { hasNotification: () => boolean },
  Props
>(({ chat }, ref) => {
  const { data: session } = useSession()
  const [message, setMessage] = useState(chat.message)
  const { socket } = useAuthenticatedWebsocket()
  const { lastMessage } = useSocketEvent(socket, chat.id)

  useImperativeHandle(
    ref,
    () => {
      return {
        hasNotification: () =>
          !message.viewedAt && message.senderId !== session?.user.id,
      }
    },
    [message.senderId, message.viewedAt, session],
  )

  useEffect(() => {
    if (!lastMessage) return

    const audio = new Audio('/assets/sounds/notification.wav')

    audio.play()

    setMessage(lastMessage)
  }, [lastMessage])

  return (
    <Link className="w-full" href={`/conversas/${chat.id}`}>
      <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm py-2 px-4">
        <div className="w-full flex items-center justify-start rounded-md cursor-pointer hover:bg-black/20">
          <Image
            className="h-10 w-10 rounded-full"
            src={chat.pet.image.path}
            alt={chat.pet.name}
            width={40}
            height={40}
          />
          <div className="flex-1 h-11 my-1 flex flex-col items-start justify-center ml-2 gap-1">
            <div className="w-full flex items-center justify-between">
              <span className="font-semibold line-clamp-1">
                {chat.pet.name}
              </span>
              {!message.viewedAt && message.senderId !== session?.user.id ? (
                <Badge className="w-4 h-4 p-0" />
              ) : null}
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="w-full flex items-center">
                {message.senderId === session?.user.id ? (
                  <CheckIcon
                    size={18}
                    className={cn(
                      'mr-2 text-muted-foreground',
                      !!message.viewedAt && 'text-primary',
                    )}
                  />
                ) : null}
                <span className="text-sm line-clamp-1 text-muted-foreground">
                  {message.content}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {message.createdAt
                  ? format(
                      new Date(message.createdAt),
                      isToday(new Date(message.createdAt))
                        ? 'p'
                        : isYesterday(new Date(message.createdAt))
                        ? "'Ontem' p"
                        : 'dd/MM/Y p',
                    )
                  : null}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

ListItemComponent.displayName = 'ListItemComponent'
