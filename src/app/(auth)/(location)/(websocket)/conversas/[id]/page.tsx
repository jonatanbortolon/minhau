import { ChatComponent } from '@/components/chat'
import { ApiResponse } from '@/types/apiResponse'
import { cloneHeaders } from '@/utils/cloneHeaders'
import { getApiUrlFromServer } from '@/utils/getApiUrlFromServer'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Minhau - Conversa',
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string } }) {
  const response: ApiResponse<{
    id: string
    pet: {
      id: string
      name: string
      image: {
        id: string
        path: string
      }
    }
    user: {
      id: string
      name: string
    }
  }> = await fetch(`${getApiUrlFromServer()}/chat/${params.id}`, {
    headers: cloneHeaders(),
  }).then((res) => res.json())

  if (!response.success) {
    return notFound()
  }

  const chat = response.payload

  return <ChatComponent chat={chat} />
}
