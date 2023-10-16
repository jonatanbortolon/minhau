import { AuthLayout } from '@/layouts/authLayout'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function Layout({ children }: Props) {
  return <AuthLayout>{children}</AuthLayout>
}
