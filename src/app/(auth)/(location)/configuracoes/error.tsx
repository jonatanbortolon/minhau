'use client'

import ErrorComponent from '@/components/error'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <ErrorComponent
      errorTitle="Aconteceu um erro!"
      errorDescription="Tivemos um problema ao carregar suas configurações, clique no botão abaixo para
        recarregar."
      error={error}
      reset={reset}
    />
  )
}
