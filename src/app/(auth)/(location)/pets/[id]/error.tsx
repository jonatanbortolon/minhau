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
    <div className="p-6">
      <ErrorComponent
        errorTitle="Aconteceu um erro!"
        errorDescription="Tivemos um problema ao carregar o pet, clique no botão abaixo para
        recarregar."
        error={error}
        reset={reset}
      />
    </div>
  )
}
