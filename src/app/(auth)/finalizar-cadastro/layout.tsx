import { ApiResponse } from '@/types/apiResponse'
import { cloneHeaders } from '@/utils/cloneHeaders'
import { getApiUrlFromServer } from '@/utils/getApiUrlFromServer'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export const dynamic = 'force-dynamic'

export default async function Layout({ children }: Props) {
  const response: ApiResponse<{ latitude: number; longitude: number } | null> =
    await fetch(`${getApiUrlFromServer()}/user/location`, {
      headers: cloneHeaders(),
    }).then((res) => res.json())

  if (!response.success) {
    throw new Error('Failed to load profile location')
  }

  const location = response.payload

  if (location) {
    return redirect('/pets')
  }

  return <>{children}</>
}
