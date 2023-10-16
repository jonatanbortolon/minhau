'use client'

import { DropdownMenuItem } from '../ui/dropdown-menu'
import { LogOutIcon } from 'lucide-react'
import { useNotification } from '@/hooks/useNotification'
import { signOut } from 'next-auth/react'

export function HeaderLogoutButtonComponent() {
  const { setNotifications } = useNotification()

  async function onClick() {
    setNotifications(true)
    signOut()
  }

  return (
    <DropdownMenuItem
      className="cursor-pointer text-destructive"
      onClick={onClick}
    >
      <LogOutIcon size={16} className="mr-2" /> Sair
    </DropdownMenuItem>
  )
}
