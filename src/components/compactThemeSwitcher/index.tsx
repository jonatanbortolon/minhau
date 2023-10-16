'use client'

import { Button } from '../ui/button'
import { Sun, Moon, ComputerIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { useState, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

export function CompactThemeSwitcherComponent() {
  const [mounted, setMounted] = useState(false)
  const { theme, changeTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all data-[show=false]:rotate-90 data-[show=false]:scale-0"
            data-show={theme === 'light'}
          />
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] data-[show=false]:rotate-90 data-[show=false]:scale-0 transition-all rotate-0 scale-100"
            data-show={theme === 'dark'}
          />
          <ComputerIcon
            className="absolute h-[1.2rem] w-[1.2rem] data-[show=false]:rotate-90 data-[show=false]:scale-0 transition-all rotate-0 scale-100"
            data-show={theme === 'system'}
          />
          <span className="sr-only">Mudar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeTheme('light')}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme('dark')}>
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme('system')}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
