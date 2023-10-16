'use client'

import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { useInfiniteQuery } from '@tanstack/react-query'

export function useAdoptionChatList() {
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(
    ['adoption-chat-list'],
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
      }> = await fetch(`${getApiUrl()}/chat/adoption?page=${pageParam}`).then(
        (res) => res.json(),
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

  return {
    status,
    data: data?.pages.map((page) => page.data).flat() ?? [],
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  }
}
