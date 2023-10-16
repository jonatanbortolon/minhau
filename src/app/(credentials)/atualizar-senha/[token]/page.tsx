import { UpdatePasswordWithTokenFormComponent } from '@/components/updatePasswordWithTokenForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Alterar senha',
}

export default function Page({ params }: { params: { token: string } }) {
  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="w-full flex items-center justify-start mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Alterar senha
        </h1>
      </div>
      <UpdatePasswordWithTokenFormComponent token={params.token} />
    </div>
  )
}
