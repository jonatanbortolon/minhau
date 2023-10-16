'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useSocket } from 'socket.io-react-hook'

type Props =
  | {
      options?: {
        enabled?: boolean
      }
    }
  | undefined

export function useAuthenticatedWebsocket(
  props: Props = { options: { enabled: true } },
) {
  const { options } = props

  const { data: session } = useSession()
  const { socket, error, connected } = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL as string,
    {
      ...options,
      enabled: !!session?.user.id && options?.enabled,
    },
  )

  useEffect(() => {
    if (!connected) return

    socket.emit('authenticate', session?.user.id)
  }, [socket, connected, session])

  return { socket, error, connected }
}
