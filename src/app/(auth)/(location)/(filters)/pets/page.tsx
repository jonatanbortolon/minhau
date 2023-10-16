import { PetListComponent } from '@/components/petList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Pets para adoção',
}

export default async function Page() {
  return <PetListComponent />
}
