'use client'

import { PetAdopted } from '@/enums/petAdopted'
import { ApiResponse } from '@/types/apiResponse'
import { getApiUrl } from '@/utils/getApiUrl'
import { PetSex, PetType } from '@prisma/client'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { cloneDeep, find, indexOf } from 'lodash'

type Props = {
  name: string | null
  sex: PetSex | null
  type: PetType | null
  distance: number
  adopted: PetAdopted | null
}

export function useFavoritePetList({
  name = null,
  sex = null,
  type = null,
  distance = 5,
  adopted = null,
}: Props) {
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
    ['pets', name, sex, type, distance, adopted],
    async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        distance: distance.toString(),
      })

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
          distance: number
          favorite: boolean
          image: {
            id: string
            path: string
          }
        }[]
        nextPage: number | null
      }> = await fetch(
        `${getApiUrl()}/pet/favorite?page=${pageParam}&${params.toString()}`,
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

  function removeFromList(petId: string) {
    const newPagesArray =
      data?.pages.map((page) => {
        const pageFiltered = cloneDeep(page)

        pageFiltered.data.splice(
          indexOf(pageFiltered.data, find(pageFiltered.data, { id: petId })),
          1,
        )

        return pageFiltered
      }) ?? []

    queryClient.setQueryData(
      ['pets', name, sex, type, distance, adopted],
      (data: any) => ({
        pages: newPagesArray,
        pageParams: data.pageParams,
      }),
    )
  }

  return {
    status,
    data: data?.pages.map((page) => page.data).flat() ?? [],
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    removeFromList,
  }
}
