'use client'

import { SessionProvider } from 'next-auth/react'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>
}
