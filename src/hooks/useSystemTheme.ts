'use client'

import { useMediaQuery } from 'usehooks-ts'

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export function useSystemTheme() {
  const isDarkOs = useMediaQuery(COLOR_SCHEME_QUERY)
  const themeOs = isDarkOs ? 'dark' : 'light'

  return themeOs
}
