'use client'

import { Filters } from '@/types/filters'
import { ReactNode, useState } from 'react'
import { produce } from 'immer'
import { filtersContext } from '@/contexts/filters'

type Props = {
  children: ReactNode
}

export function FiltersProvider({ children }: Props) {
  const [filters, setFilters] = useState<Filters>({
    name: null,
    distance: 5,
    adopted: null,
    sex: null,
    type: null,
  })

  function setFilter<T extends keyof Filters>(filter: T, value: Filters[T]) {
    setFilters(
      produce((state) => {
        state[filter] = value
      }),
    )
  }

  return (
    <filtersContext.Provider
      value={{
        filters,
        setFilter,
      }}
    >
      {children}
    </filtersContext.Provider>
  )
}
