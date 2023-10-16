'use client'

import { filtersContext } from '@/contexts/filters'
import { useContext } from 'react'

export function useFilters() {
  const { filters, setFilter } = useContext(filtersContext)

  return {
    filters,
    setFilter,
  }
}
