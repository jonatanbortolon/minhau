import { authOptions } from '@/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { user = null } = (await getServerSession(authOptions)) ?? {
    user: null,
  }

  if (!user) return redirect('/entrar')

  return redirect('/pets')
}
