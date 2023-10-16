'use client'

import { cn } from '@/libs/utils'
import { LucideIcon } from 'lucide-react'
import { Url } from 'next/dist/shared/lib/router/router'
import Link from 'next/link'

type Props = {
  selected?: boolean
  url: Url
  icon: LucideIcon
  text?: string
}

export function BottomTabItemComponent({
  icon: Icon,
  selected = false,
  url,
  text,
}: Props) {
  return (
    <Link
      className={cn(
        'flex-1 h-full flex flex-col justify-center items-center px-4 py-1 text-xs',
        selected ? 'text-primary' : 'text-muted-foreground',
      )}
      href={url}
    >
      <Icon className="mb-1" />
      {text}
    </Link>
  )
}
