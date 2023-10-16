'use client'

import { ThemeContext, themeContext } from '@/contexts/theme'
import { useState, PropsWithChildren } from 'react'
import { useMediaQuery, useUpdateEffect, useEffectOnce } from 'usehooks-ts'
import { setCookie } from 'cookies-next'

type Props = PropsWithChildren<{
  initialTheme: ThemeContext['theme']
}>

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export function ThemeProvider({ initialTheme, children }: Props) {
  const [theme, setTheme] = useState(initialTheme)
  const isDarkOs = useMediaQuery(COLOR_SCHEME_QUERY)
  const themeOs = isDarkOs ? 'dark' : 'light'

  function changeTheme(theme: typeof initialTheme) {
    setCookie('theme', theme)

    setTheme(theme)
  }

  useUpdateEffect(() => {
    const html = document.getElementsByTagName('html')[0]

    if (theme === 'system') {
      if (themeOs === 'light') {
        html.classList.remove('dark')
        html.classList.add('light')
      }

      if (themeOs === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      }
    }

    if (theme === 'light') {
      html.classList.remove('dark')
      html.classList.add('light')
    }

    if (theme === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    }
  }, [theme, themeOs])

  useEffectOnce(() => {
    const html = document.getElementsByTagName('html')[0]

    if (theme === 'system') {
      if (themeOs === 'light') {
        html.classList.remove('dark')
        html.classList.add('light')
      }

      if (themeOs === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      }
    }
  })

  return (
    <themeContext.Provider
      value={{
        theme,
        changeTheme,
      }}
    >
      {children}
    </themeContext.Provider>
  )
}
