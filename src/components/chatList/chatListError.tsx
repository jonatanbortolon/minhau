import Image from 'next/image'
import { Button } from '../ui/button'

type Props = {
  refetch: () => void
}

export function ChatListErrorComponent({ refetch }: Props) {
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
      <span className="text-lg font-semibold text-center">
        Aconteceu um erro!
      </span>
      <span className="text-sm text-muted-foreground text-center">
        Tivemos um problema ao carregar suas conversas clique no botão abaixo
        para recarregar!
      </span>
      <Button className="w-full mt-4" onClick={() => refetch()}>
        Recarregar
      </Button>
    </div>
  )
}
