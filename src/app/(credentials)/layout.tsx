import { authOptions } from '@/authOptions'
import { CredentialsLayout } from '@/layouts/credentialsLayout'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export default async function Layout({ children }: Props) {
  const { user = null } = (await getServerSession(authOptions)) ?? {
    user: null,
  }

  if (user) {
    redirect('/pets')
  }

  return <CredentialsLayout>{children}</CredentialsLayout>
}
