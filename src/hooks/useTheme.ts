'use client'

import { themeContext } from '@/contexts/theme'
import { useContext } from 'react'

export function useTheme() {
  const { theme, changeTheme } = useContext(themeContext)

  return {
    theme,
    changeTheme,
  }
}
