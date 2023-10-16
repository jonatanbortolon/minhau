import { PetDetailComponent } from '@/components/petDetail'
import { ApiResponse } from '@/types/apiResponse'
import { cloneHeaders } from '@/utils/cloneHeaders'
import { getApiUrlFromServer } from '@/utils/getApiUrlFromServer'
import { PetSex, PetType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const response: ApiResponse<{
    id: string
    name: string
    description: string | null
    sex: PetSex
    type: PetType
    adoptedAt: string | null
    createdAt: string
    distance: number
    favorite: boolean
    chatId: string | null
    images: {
      id: string
      path: string
    }[]
    owner: {
      id: string
      name: string
    }
  }> = await fetch(`${getApiUrlFromServer()}/pet/${params.id}`, {
    headers: cloneHeaders(),
  }).then((res) => res.json())

  if (!response.success) {
    return {
      title: '',
    }
  }

  return {
    title: 'Minhau - ' + response.payload.name,
    openGraph: {
      images: response.payload.images.map((image) => image.path),
    },
  }
}
export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string } }) {
  const response: ApiResponse<{
    id: string
    name: string
    description: string | null
    sex: PetSex
    type: PetType
    adoptedAt: string | null
    createdAt: string
    distance: number
    favorite: boolean
    chatId: string | null
    images: {
      id: string
      path: string
    }[]
    owner: {
      id: string
      name: string
      image: string
    }
  }> = await fetch(`${getApiUrlFromServer()}/pet/${params.id}`, {
    headers: cloneHeaders(),
  }).then((res) => res.json())

  if (!response.success) {
    return notFound()
  }

  const pet = response.payload

  return <PetDetailComponent pet={pet} />
}
