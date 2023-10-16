import { NotFoundComponent } from '@/components/notFound'

export default function NotFound() {
  return (
    <NotFoundComponent
      errorTitle="Pet não encontrado!"
      errorDescription="Não conseguimos encontrar o pet, tente novamente."
    />
  )
}
