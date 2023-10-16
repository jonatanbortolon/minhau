'use client'

import { Button } from '../ui/button'
import Image from 'next/image'
import { ListItemComponent } from './listItem'
import { useChatMessages } from '@/hooks/useChatMessages'
import { ChatHeaderComponent } from '../chatHeader'
import { SendMessageFormComponent } from './sendMessageForm'
import { Loader2Icon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAuthenticatedWebsocket } from '@/hooks/useAuthenticatedWebsocket'
import { useSocketEvent } from 'socket.io-react-hook'
import { ScrollToTopComponent } from '../scrollToTop'

type Props = {
  chat: {
    id: string
    pet: {
      id: string
      name: string
      image: {
        path: string
      }
    }
    user: {
      id: string
      name: string
    }
  }
}

export function ChatComponent({ chat }: Props) {
  const {
    status,
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    pushMessage,
  } = useChatMessages(chat.id)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()
  const { socket } = useAuthenticatedWebsocket()
  const { lastMessage } = useSocketEvent(socket, chat.id)

  useEffect(() => {
    if (!lastMessage) return

    const audio = new Audio('/assets/sounds/notification.wav')

    audio.play()

    pushMessage(lastMessage)
  }, [lastMessage])

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      <div className="w-full h-full flex flex-col overflow-hidden">
        <ChatHeaderComponent
          petId={chat.pet.id}
          petImageUrl={chat.pet.image.path}
          petName={chat.pet.name}
          userName={chat.user.name}
        />
        <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto">
          {status === 'loading' ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2Icon className="w-1/12 h-auto animate-spin" />
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center justify-center px-6">
              <div className="w-1/4 mb-4">
                <Image
                  className="w-full aspect-square"
                  src="/assets/images/sad-cat.png"
                  width={200}
                  height={200}
                  alt="Gato triste"
                />
              </div>
              <span className="text-lg font-semibold text-center">
                Aconteceu um erro!
              </span>
              <span className="text-sm text-muted-foreground text-center">
                Tivemos um problema ao carregar suas mensagens, clique no botão
                abaixo para recarregar!
              </span>
              <Button className="w-full mt-4" onClick={() => refetch()}>
                Recarregar
              </Button>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="w-full h-full flex flex-col-reverse overflow-y-auto gap-6 px-6 pb-4"
            >
              {data.map((message) => (
                <ListItemComponent
                  key={`message-${message.id}`}
                  message={message}
                />
              ))}
              <div
                ref={ref}
                className="w-full h-[1px] mt-4 flex items-center justify-center bg-transparent pointer-events-none"
              >
                <Loader2Icon
                  size={24}
                  className="animate-spin hidden data-[show=true]:inline"
                  data-show={isFetchingNextPage}
                />
              </div>
            </div>
          )}
        </div>
        <SendMessageFormComponent chatId={chat.id} onSent={pushMessage} />
      </div>
      <ScrollToTopComponent
        scrollRef={scrollRef}
        reverse
        marginVertical={104}
        right
      />
    </>
  )
}
