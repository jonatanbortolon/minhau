'use client'

import { createContext } from 'react'

export type ThemeContext = {
  theme: 'light' | 'dark' | 'system'
  changeTheme: (theme: ThemeContext['theme']) => void
}

export const themeContext = createContext<ThemeContext>({} as ThemeContext)
