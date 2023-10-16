'use client'

import { usePathname } from 'next/navigation'
import { BottomTabItemComponent } from './item'
import { CatIcon, HeartIcon, SearchIcon } from 'lucide-react'

export function BottomTabComponent() {
  const pathname = usePathname()

  return (
    <div className="z-50 bg-background fixed left-0 bottom-0 right-0 w-screen flex items-center justify-center border-t h-16">
      <div className="w-full h-full px-4 flex justify-center items-center gap-4">
        <BottomTabItemComponent
          text="Pets"
          url="/pets"
          selected={pathname === '/pets'}
          icon={SearchIcon}
        />
        <BottomTabItemComponent
          text="Meus"
          url="/pets/meus"
          selected={pathname === '/pets/meus'}
          icon={CatIcon}
        />
        <BottomTabItemComponent
          text="Favoritos"
          url="/pets/favoritos"
          selected={pathname === '/pets/favoritos'}
          icon={HeartIcon}
        />
      </div>
    </div>
  )
}
