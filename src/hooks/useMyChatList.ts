'use client'

import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { cloneDeep } from 'lodash'

export function useMyChatList() {
  const queryClient = useQueryClient()
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(
    ['my-chat-list'],
    async ({ pageParam = 0 }) => {
      const response: ApiResponse<{
        data: {
          id: string
          user1Id: string
          user2Id: string
          pet: {
            name: string
            image: {
              id: string
              path: string
            }
          }
          message: {
            senderId: string
            content: string
            createdAt: string
            viewedAt: string | null
          }
        }[]
        nextPage: number | null
      }> = await fetch(`${getApiUrl()}/chat/my?page=${pageParam}`).then((res) =>
        res.json(),
      )

      if (!response.success) {
        throw new Error(response.payload.message)
      }

      return response.payload
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    },
  )

  function pushChat(chat: {
    id: string
    user1Id: string
    user2Id: string
    pet: {
      name: string
      image: {
        id: string
        path: string
      }
    }
    message: {
      senderId: string
      content: string
      createdAt: string
      viewedAt: string | null
    }
  }) {
    const newPagesArray = cloneDeep(data?.pages ?? [])

    const lastPage = newPagesArray.at(-1)

    if (!lastPage) {
      newPagesArray.push({
        data: [chat],
        nextPage: null,
      })
    } else {
      if (
        lastPage.data.length >=
        parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE as string)
      ) {
        lastPage.nextPage = newPagesArray.length

        newPagesArray.push({
          data: [chat],
          nextPage: null,
        })
      } else {
        lastPage.data.push(chat)
      }
    }

    queryClient.setQueryData(['my-chat-list'], (data: any) => ({
      pages: newPagesArray,
      pageParams: data.pageParams,
    }))
  }

  return {
    status,
    data: data?.pages.map((page) => page.data).flat() ?? [],
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    pushChat,
  }
}
