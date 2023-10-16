import { Filters } from '@/types/filters'
import { createContext } from 'react'

export type FiltersContext = {
  filters: Filters
  setFilter: <T extends keyof Filters>(filter: T, value: Filters[T]) => void
}

export const filtersContext = createContext<FiltersContext>(
  {} as FiltersContext,
)
