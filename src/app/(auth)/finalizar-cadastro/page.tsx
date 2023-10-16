import { PostSignupFormComponent } from '@/components/postSignupForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Finalizar cadastro',
}

export default function Page() {
  return (
    <div className="w-full flex flex-col my-8 px-6">
      <div className="w-full flex items-center justify-start mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Finalizar cadastro
        </h1>
      </div>
      <PostSignupFormComponent />
    </div>
  )
}
