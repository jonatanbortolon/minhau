'use client'

import { cn } from '@/libs/utils'
import { format, isToday, isYesterday } from 'date-fns'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'
import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { CheckIcon } from 'lucide-react'
import { useAuthenticatedWebsocket } from '@/hooks/useAuthenticatedWebsocket'
import { useSocketEvent } from 'socket.io-react-hook'
import { useUpdateEffect } from 'usehooks-ts'
import { useSession } from 'next-auth/react'

type Props = {
  message: {
    id: string
    content: string
    senderId: string
    createdAt: string
    viewedAt: string | null
  }
}

export function ListItemComponent({ message }: Props) {
  const [ballonRef, baloonInView] = useInView()
  const { data: session } = useSession()
  const [viewed, setViewed] = useState(false)
  const { socket } = useAuthenticatedWebsocket({
    options: {
      enabled: !viewed && message.senderId === session?.user.id,
    },
  })
  const { lastMessage } = useSocketEvent(socket, message.id)

  useEffect(() => {
    if (!lastMessage) return

    setViewed(true)
  }, [lastMessage])

  useEffect(() => {
    setViewed(!!message.viewedAt)
  }, [message])

  useUpdateEffect(() => {
    if (!baloonInView) return

    if (viewed) return

    if (message.senderId === session?.user.id) return

    async function viewMessage() {
      const response: ApiResponse = await fetch(
        `${getApiUrl()}/message/${message.id}`,
        {
          method: 'PUT',
        },
      ).then((res) => res.json())

      if (response.success) return setViewed(false)

      setViewed(true)
    }

    viewMessage()
  }, [baloonInView, message.id, message.senderId, session, viewed])

  return (
    <div
      className={cn(
        'w-full flex',
        message.senderId === session?.user.id ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        ref={ballonRef}
        className={cn(
          'rounded-3xl max-w-[60%] flex flex-col items-end p-3',
          message.senderId === session?.user.id
            ? 'rounded-br-none bg-foreground/30 dark:text-foreground'
            : 'rounded-bl-none bg-primary',
        )}
      >
        <div className="w-full">
          <span className="break-words whitespace-pre-wrap">
            {message.content}
          </span>
        </div>
        <div className="flex items-center flex-nowrap">
          <span
            className={cn(
              'text-sm',
              message.senderId === session?.user.id
                ? 'text-muted-foreground'
                : 'text-muted/50',
            )}
          >
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
          {message.senderId === session?.user.id ? (
            <CheckIcon
              size={18}
              className={cn(
                'ml-2 text-muted-foreground',
                viewed && 'text-primary',
              )}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
