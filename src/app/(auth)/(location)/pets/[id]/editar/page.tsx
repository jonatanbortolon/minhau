import { UpdatePetFormComponent } from '@/components/updatePetForm'
import { ApiResponse } from '@/types/apiResponse'
import { cloneHeaders } from '@/utils/cloneHeaders'
import { getApiUrlFromServer } from '@/utils/getApiUrlFromServer'
import { PetSex, PetType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Minhau - Editar pet',
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string } }) {
  const res: ApiResponse<{
    id: string
    name: string
    description: string | null
    sex: PetSex
    type: PetType
    adoptedAt: Date | null
    createdAt: Date
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
    next: {
      tags: [`pet-${params.id}`],
    },
  }).then((res) => res.json())

  if (!res.success) {
    return notFound()
  }

  const pet = res.payload

  return (
    <div className="w-full flex flex-col p-6">
      <div className="w-full flex items-center justify-start mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Editar pet
        </h1>
      </div>
      <UpdatePetFormComponent initialData={pet} />
    </div>
  )
}
