'use client'

import { SessionProvider } from 'next-auth/react'
import { PropsWithChildren } from 'react'
import { Session } from 'next-auth'

type Props = PropsWithChildren<{
  session?: Session | null
}>

export function AuthProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
