import { SigninFormComponent } from '@/components/signinForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Entrar',
}

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="w-full flex items-center justify-start mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Entrar
        </h1>
      </div>
      <SigninFormComponent />
    </div>
  )
}
