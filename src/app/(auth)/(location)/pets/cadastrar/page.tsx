import { CreatePetFormComponent } from '@/components/createPetForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Cadastrar pet',
}

export default async function Page() {
  return (
    <div className="w-full flex flex-col p-6">
      <div className="w-full flex items-center justify-start mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Cadastrar pet
        </h1>
      </div>
      <CreatePetFormComponent />
    </div>
  )
}
