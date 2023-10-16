'use client'

import { ReactNode, useEffect, useState } from 'react'
import OneSignal from 'react-onesignal'
import { useNotification } from '@/hooks/useNotification'
import { useSession } from 'next-auth/react'
import { useEffectOnce } from 'usehooks-ts'

type Props = {
  children: ReactNode
}

export function NotificationProvider({ children }: Props) {
  const { data: session } = useSession()
  const { enabled: notificationsEnabled } = useNotification()
  const [initialized, setInitialized] = useState(false)

  useEffectOnce(() => {
    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID as string,
      safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID as string,
      notifyButton: {
        enable: false,
      },
      allowLocalhostAsSecureOrigin:
        process.env.NEXT_PUBLIC_BROWSER_ENV !== 'production',
    }).then(() => {
      OneSignal.Slidedown.promptPush().then(() => {
        setInitialized(true)
      })
    })
  })

  useEffect(() => {
    if (!initialized) return

    if (!notificationsEnabled || !session) {
      OneSignal.logout()
    }

    if (notificationsEnabled && session) {
      OneSignal.login(session.user.id)
    }
  }, [initialized, session, notificationsEnabled])

  return children
}
