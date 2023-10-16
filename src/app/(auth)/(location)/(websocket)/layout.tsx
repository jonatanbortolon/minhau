import { WebsocketProvider } from '@/providers/websocket'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export default function Layout({ children }: Props) {
  return <WebsocketProvider>{children}</WebsocketProvider>
}
