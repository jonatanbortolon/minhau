import { cn } from '@/libs/utils'

type Props = {
  className?: string
  icon: string
  fill?: boolean
  data?: {
    [key: `data-${string}`]: any
  }
}

export function GoogleIconComponent({ className, icon, fill, data }: Props) {
  return (
    <i
      className={cn(
        'material-symbols-outlined',
        fill ? 'filled' : undefined,
        className,
      )}
      {...data}
    >
      {icon}
    </i>
  )
}
