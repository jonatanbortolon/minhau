'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import Image from 'next/image'

type Props = {
  error: Error
  reset: () => void
  errorTitle: string
  errorDescription: string
}

export default function ErrorComponent({
  error,
  reset,
  errorTitle,
  errorDescription,
}: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  function onRefreshPageClick() {
    reset()
  }

  return (
    <div className="flex flex-col items-center justify-center">
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
      <Button className="w-full mt-4" onClick={onRefreshPageClick}>
        Recarregar
      </Button>
    </div>
  )
}
