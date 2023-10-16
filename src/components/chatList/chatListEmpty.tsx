import Image from 'next/image'

export function ChatListEmptyComponent() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      <div className="w-1/4 mb-4">
        <Image
          className="w-full aspect-square"
          src="/assets/images/sad-cat.png"
          width={200}
          height={200}
          alt="Gato triste"
        />
      </div>
      <span className="text-lg font-semibold">Vazio!!!</span>
      <span className="text-sm text-muted-foreground">
        Você não possui nenhuma conversa!
      </span>
    </div>
  )
}
