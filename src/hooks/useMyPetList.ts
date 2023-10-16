'use client'

import { PetAdopted } from '@/enums/petAdopted'
import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { PetSex, PetType } from '@prisma/client'
import { useInfiniteQuery } from '@tanstack/react-query'

type Props = {
  name: string | null
  sex: PetSex | null
  type: PetType | null
  adopted: PetAdopted | null
}

export function useMyPetList({
  name = null,
  sex = null,
  type = null,
  adopted = null,
}: Props) {
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(
    ['my-pets', name, sex, type, adopted],
    async ({ pageParam = 0 }) => {
      const params = new URLSearchParams()

      if (name) {
        params.set('name', name)
      }

      if (sex) {
        params.set('sex', sex)
      }

      if (type) {
        params.set('type', type)
      }

      if (adopted) {
        params.set('adopted', String(adopted))
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
          image: {
            id: string
            path: string
          }
        }[]
        nextPage: number | null
      }> = await fetch(
        `${getApiUrl()}/pet/my?page=${pageParam}&${params.toString()}`,
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
