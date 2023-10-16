import { NotFoundComponent } from '@/components/notFound'

export default function NotFound() {
  return (
    <NotFoundComponent
      errorTitle="Página não encontrada!"
      errorDescription="Não conseguimos encontrar a página solicitada, tente novamente."
    />
  )
}
