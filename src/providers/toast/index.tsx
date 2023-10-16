import { Toaster } from '@/components/ui/toaster'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function ToastProvider({ children }: Props) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
