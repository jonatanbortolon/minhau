import { NotFoundComponent } from '@/components/notFound'

export default function NotFound() {
  return (
    <NotFoundComponent
      errorTitle="Conversa não encontrada!"
      errorDescription="Não conseguimos encontrar a conversa, tente novamente."
    />
  )
}
