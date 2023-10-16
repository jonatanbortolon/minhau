'use client'

import { PropsWithChildren } from 'react'
import { IoProvider } from 'socket.io-react-hook'

type Props = PropsWithChildren

export function WebsocketProvider({ children }: Props) {
  return <IoProvider>{children}</IoProvider>
}
