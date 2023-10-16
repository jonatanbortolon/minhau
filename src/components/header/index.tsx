'use client'

import { nameToInitials } from '@/utils/nameToInitials'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import {
  MessageCircleIcon,
  User2Icon,
  CogIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
} from 'lucide-react'
import Link from 'next/link'
import { HeaderLogoutButtonComponent } from './logoutButton'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { useSession } from 'next-auth/react'

export function HeaderComponent() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  function onGoBackClick() {
    router.push('/pets')
  }

  return (
    <div className="z-50 bg-background fixed left-0 top-0 right-0 w-screen flex items-center justify-center border-b h-16">
      <div className="w-full h-full px-4 flex items-center">
        {(!pathname.startsWith('/pets') || pathname.startsWith('/pets/')) &&
        pathname !== '/finalizar-cadastro' ? (
          <Button variant="ghost" onClick={onGoBackClick}>
            <ArrowLeftIcon />
          </Button>
        ) : null}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2">
                <Avatar className="relative cursor-pointer">
                  <AvatarImage
                    src={session?.user.image || undefined}
                    alt={session?.user.name ?? ''}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {nameToInitials(session?.user.name ?? '')}
                  </AvatarFallback>
                </Avatar>
                <ChevronDownIcon className="h-4 w-4 shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/perfil">
                <DropdownMenuItem className="cursor-pointer">
                  <User2Icon size={16} className="mr-2" /> Meu perfil
                </DropdownMenuItem>
              </Link>
              <Link href="/conversas">
                <DropdownMenuItem className="cursor-pointer">
                  <MessageCircleIcon size={16} className="mr-2" />
                  Conversas
                </DropdownMenuItem>
              </Link>
              <Link href="/configuracoes">
                <DropdownMenuItem className="cursor-pointer">
                  <CogIcon size={16} className="mr-2" /> Configurações
                </DropdownMenuItem>
              </Link>
              <HeaderLogoutButtonComponent />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
