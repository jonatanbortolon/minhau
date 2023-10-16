'use client'

import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { cloneDeep } from 'lodash'

export function useChatMessages(id: string) {
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
    ['chat', id],
    async ({ pageParam = 0 }) => {
      const response: ApiResponse<{
        data: {
          id: string
          content: string
          senderId: string
          createdAt: string
          viewedAt: string | null
        }[]
        nextPage: number | null
      }> = await fetch(
        `${getApiUrl()}/chat/${id}/message?page=${pageParam}`,
      ).then((res) => res.json())

      if (!response.success) {
        throw new Error(response.payload.message)
      }

      return response.payload
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    },
  )

  function pushMessage(message: {
    id: string
    content: string
    senderId: string
    createdAt: string
    viewedAt: string | null
  }) {
    const newPagesArray = cloneDeep(data?.pages) ?? []

    newPagesArray.at(-1)?.data.unshift(message)

    queryClient.setQueryData(['chat', id], (data: any) => ({
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
    pushMessage,
  }
}
