import { FavoritePetListComponent } from '@/components/favoritePetList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minhau - Pets favoritos',
}

export default async function Page() {
  return <FavoritePetListComponent />
}
