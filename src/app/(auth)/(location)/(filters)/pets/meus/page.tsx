import { MyPetListComponent } from '@/components/myPetList'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Minhau - Meus pets',
}

export default async function Page() {
  return (
    <>
      <MyPetListComponent />
      <Link
        className="sticky ml-auto bottom-4 right-4 -mt-14"
        href="/pets/cadastrar"
      >
        <Button className="w-14 h-14 rounded-full" size="icon">
          <PlusIcon size={28} />
        </Button>
      </Link>
    </>
  )
}
