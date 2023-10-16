import './globals.css'
import 'material-symbols/outlined.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/libs/utils'
import { ThemeProvider } from '@/providers/theme'
import { getServerTheme } from '@/utils/getServerTheme'
import { ToastProvider } from '@/providers/toast'
import { QueryProvider } from '@/providers/query'
import { AuthProvider } from '@/providers/auth'
import { NotificationProvider } from '@/providers/notification'
import { PropsWithChildren } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/authOptions'

const interFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Minhau',
  applicationName: 'Minhau',
  description: 'Vários pets esperando por você, adote um pet já!',
  appleWebApp: {
    capable: true,
    title: 'Minhau',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#06b6d4',
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  manifest: '/manifest.json',
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/apple-touch-icon.png' },
    { rel: 'shortcut icon', url: '/favicon.ico' },
  ],
  keywords: [
    'minhau',
    'gato',
    'gatos',
    'cachorro',
    'cachorros',
    'adoção',
    'adote',
    'pet',
    'pets',
  ],
}

type Props = PropsWithChildren

export const dynamic = 'force-dynamic'

export default async function Layout({ children }: Props) {
  const session = await getServerSession(authOptions)
  const initialTheme = getServerTheme()

  return (
    <html
      lang="pt-BR"
      className={cn(
        interFont.variable,
        'font-inter',
        initialTheme === 'system' ? undefined : initialTheme,
      )}
    >
      <body>
        <AuthProvider session={session}>
          <NotificationProvider>
            <ThemeProvider initialTheme={initialTheme}>
              <ToastProvider>
                <QueryProvider>
                  <div className="relative w-full min-h-full max-w-md flex flex-col mx-auto">
                    {children}
                  </div>
                </QueryProvider>
              </ToastProvider>
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
