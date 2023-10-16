'use client'

import { BottomTabComponent } from '@/components/bottomTab'
import { HeaderComponent } from '@/components/header'
import { cn } from '@/libs/utils'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function AuthLayout({ children }: Props) {
  const pathname = usePathname()

  return (
    <>
      <HeaderComponent />
      <div
        className={cn(
          'absolute mt-16 inset-0 flex flex-col overflow-y-auto',
          pathname.startsWith('/pets') && 'mb-16',
        )}
      >
        {children}
      </div>
      {pathname.startsWith('/pets') ? <BottomTabComponent /> : null}
    </>
  )
}
