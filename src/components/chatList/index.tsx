'use client'

import { useHookWithRefCallback } from '@/hooks/useHookWithRefCallback'
import { ScrollToTopComponent } from '../scrollToTop'
import { useAuthenticatedWebsocket } from '@/hooks/useAuthenticatedWebsocket'
import { useMyChatList } from '@/hooks/useMyChatList'
import { useCallback, useEffect, useState } from 'react'
import { useSocketEvent } from 'socket.io-react-hook'
import { ListComponent } from '../list'
import { ChatListErrorComponent } from './chatListError'
import { ChatListLoadingComponent } from './chatListLoading'
import { ListItemComponent } from './listItem'
import Image from 'next/image'
import { useAdoptionChatList } from '@/hooks/useAdoptionChatList'
import { Badge } from '../ui/badge'

export function ChatListComponent() {
  const {
    status: myStatus,
    data: myData,
    isFetchingNextPage: myIsFetchingNextPage,
    fetchNextPage: myFetchNextPage,
    hasNextPage: myHasNextPage,
    refetch: myRefetch,
    pushChat: myPushChat,
  } = useMyChatList()
  const {
    status: adoptionsStatus,
    data: adoptionsData,
    isFetchingNextPage: adoptionsIsFetchingNextPage,
    fetchNextPage: adoptionsFetchNextPage,
    hasNextPage: adoptionsHasNextPage,
    refetch: adoptionsRefetch,
  } = useAdoptionChatList()
  const [notifyMy, setNotifyMy] = useState(false)
  const [notifyAdoptions, setNotifyAdoptions] = useState(false)
  const [tab, setTab] = useState('my')
  const { socket } = useAuthenticatedWebsocket()
  const { lastMessage } = useSocketEvent(socket, 'new-chat')
  const inViewComponentRef = useHookWithRefCallback<HTMLDivElement>()
  const headerHeight = 64 // px
  const componentTopffset = inViewComponentRef.current?.offsetTop ?? 0 // px

  const onMyRefCallback = useCallback(
    (node: { hasNotification: () => boolean }) => {
      if (!node) return

      if (notifyMy) return

      setNotifyMy(node.hasNotification())
    },
    [notifyMy],
  )

  const onAdoptionsRefCallback = useCallback(
    (node: { hasNotification: () => boolean }) => {
      if (!node) return

      if (notifyAdoptions) return

      setNotifyAdoptions(node.hasNotification())
    },
    [notifyAdoptions],
  )

  useEffect(() => {
    if (!lastMessage) return

    const audio = new Audio('/assets/sounds/notification.wav')

    audio.play()

    myPushChat(lastMessage)
  }, [lastMessage])

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="h-full flex flex-col gap-2">
          <div
            ref={inViewComponentRef}
            className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2"
          >
            <div
              className="relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
              onClick={() => setTab('my')}
              data-state={tab === 'my' ? 'active' : false}
            >
              Meus pets
              {notifyMy ? (
                <Badge className="z-50 absolute w-4 h-4 p-0 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
              ) : null}
            </div>
            <div
              className="relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
              onClick={() => setTab('adoptions')}
              data-state={tab === 'adoptions' ? 'active' : false}
            >
              Adoções
              {notifyAdoptions ? (
                <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 px-2">
                  &nbsp;
                </Badge>
              ) : null}
            </div>
          </div>
          <div
            className="hidden flex-1 data-[state=active]:block"
            data-state={tab === 'my' ? 'active' : false}
          >
            <div className="h-full flex flex-col">
              <ListComponent
                pullToRefreshClassName="gap-2"
                status={myStatus}
                data={myData}
                isFetchingNextPage={myIsFetchingNextPage}
                fetchNextPage={myFetchNextPage}
                refetch={myRefetch}
                hasNextPage={myHasNextPage ?? false}
                loadingComponent={<ChatListLoadingComponent />}
                errorComponent={<ChatListErrorComponent refetch={myRefetch} />}
                emptyComponent={
                  <div className="w-full flex-1 flex flex-col items-center justify-center">
                    <div className="w-1/4 mb-4">
                      <Image
                        className="w-full aspect-square"
                        src="/assets/images/sad-cat.png"
                        width={200}
                        height={200}
                        alt="Gato triste"
                      />
                    </div>
                    <span className="text-lg font-semibold">Vazio!!!</span>
                    <span className="text-sm text-muted-foreground">
                      Você não possui nenhuma conversa!
                    </span>
                  </div>
                }
                render={(chat) => (
                  <ListItemComponent
                    ref={onMyRefCallback}
                    key={chat.id}
                    chat={chat}
                  />
                )}
              />
            </div>
          </div>
          <div
            className="hidden flex-1 data-[state=active]:block"
            data-state={tab === 'adoptions' ? 'active' : false}
          >
            <div className="h-full flex flex-col">
              <ListComponent
                pullToRefreshClassName="gap-2"
                status={adoptionsStatus}
                data={adoptionsData}
                isFetchingNextPage={adoptionsIsFetchingNextPage}
                fetchNextPage={adoptionsFetchNextPage}
                refetch={adoptionsRefetch}
                hasNextPage={adoptionsHasNextPage ?? false}
                loadingComponent={<ChatListLoadingComponent />}
                errorComponent={
                  <ChatListErrorComponent refetch={adoptionsRefetch} />
                }
                emptyComponent={
                  <div className="w-full flex-1 flex flex-col items-center justify-center">
                    <div className="w-1/4 mb-4">
                      <Image
                        className="w-full aspect-square"
                        src="/assets/images/sad-cat.png"
                        width={200}
                        height={200}
                        alt="Gato triste"
                      />
                    </div>
                    <span className="text-lg font-semibold">Vazio!!!</span>
                    <span className="text-sm text-muted-foreground">
                      Você não possui nenhuma conversa!
                    </span>
                  </div>
                }
                render={(chat) => (
                  <ListItemComponent
                    ref={onAdoptionsRefCallback}
                    key={chat.id}
                    chat={chat}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
      <ScrollToTopComponent offset={headerHeight + componentTopffset} />
    </>
  )
}
