import { cn } from '@/libs/utils'
import type { TextareaAutosizeProps } from 'react-textarea-autosize'
import { inputVariants } from '../ui/input'
import dynamic from 'next/dynamic'

const TextareaAutosize = dynamic(
  () => import('react-textarea-autosize').then((c) => c.default),
  {
    ssr: false,
  },
)

type Props = TextareaAutosizeProps

export function TextareaAutosizeInputComponent({
  className,
  ...restProps
}: Props) {
  return (
    <TextareaAutosize
      className={cn(inputVariants(), 'resize-none', className)}
      {...restProps}
    />
  )
}
