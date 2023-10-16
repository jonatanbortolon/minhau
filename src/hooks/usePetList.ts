'use client'

import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { PetSex, PetType } from '@prisma/client'
import { useInfiniteQuery } from '@tanstack/react-query'

type Props = {
  sex: PetSex | null
  type: PetType | null
  distance: number
}

export function usePetList({ sex = null, type = null, distance = 5 }: Props) {
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(
    ['pets', sex, type, distance],
    async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        distance: distance.toString(),
      })

      if (sex) {
        params.set('sex', sex)
      }

      if (type) {
        params.set('type', type)
      }

      const response: ApiResponse<{
        data: {
          id: string
          name: string
          description: string | null
          sex: PetSex
          type: PetType
          adoptedAt: string | null
          createdAt: string
          userId: string
          distance: number
          favorite: boolean
          image: {
            id: string
            path: string
          }
        }[]
        nextPage: number | null
      }> = await fetch(
        `${getApiUrl()}/pet?page=${pageParam}&${params.toString()}`,
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
