'use client'

import Image from 'next/image'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { HeaderComponent } from '../header'

type Props = {
  errorTitle: string
  errorDescription: string
}

export function NotFoundComponent({ errorTitle, errorDescription }: Props) {
  const router = useRouter()

  function onGoBackClick() {
    router.back()
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <HeaderComponent />
      <div className="w-full mt-16 h-full flex flex-col items-center justify-center p-6">
        <div className="w-1/4 mb-4">
          <Image
            className="w-full aspect-square"
            src="/assets/images/sad-cat.png"
            width={200}
            height={200}
            alt="Gato triste"
          />
        </div>
        <span className="text-lg font-semibold text-center">{errorTitle}</span>
        <span className="text-sm text-muted-foreground text-center">
          {errorDescription}
        </span>
        <Button className="w-full mt-4" onClick={onGoBackClick}>
          Voltar
        </Button>
      </div>
    </div>
  )
}
