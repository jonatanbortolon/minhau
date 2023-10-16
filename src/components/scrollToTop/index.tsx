import { cn } from '@/libs/utils'
import { Button } from '../ui/button'
import { ChevronUp } from 'lucide-react'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { throttle } from 'lodash'
import scrollparent from 'scrollparent'
import { useEffectOnce } from 'usehooks-ts'

type Props = {
  scrollRef?: RefObject<HTMLElement> | null
  offset?: number
  reverse?: boolean
  right?: boolean
  top?: boolean
  marginHorizontal?: number
  marginVertical?: number
}

export function ScrollToTopComponent({
  scrollRef = null,
  offset = 0,
  reverse = false,
  right = false,
  top = false,
  marginHorizontal,
  marginVertical,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isInView, setIsInView] = useState(false)
  const onScrollThrottleMilliseconds = 100

  useEffectOnce(() => {
    calculateIfIsVisibleCallback()
  })

  const calculateIfIsVisibleCallback = useCallback(() => {
    let isVisible = false

    if (scrollRef && scrollRef.current) {
      isVisible = !(reverse
        ? scrollRef.current.scrollTop - offset < 0
        : scrollRef.current.scrollTop - offset > 0)
    } else {
      if (ref && ref.current) {
        const scrollContainer = scrollparent(ref.current)

        if (!scrollContainer) return

        isVisible = !(reverse
          ? scrollContainer.scrollTop - offset < 0
          : scrollContainer.scrollTop - offset > 0)
      }
    }

    setIsInView(isVisible)
  }, [offset, reverse, scrollRef])

  const onScollCallback = useCallback(() => {
    calculateIfIsVisibleCallback()
  }, [calculateIfIsVisibleCallback])

  const onScroll = throttle(onScollCallback, onScrollThrottleMilliseconds)

  useEffect(() => {
    document.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('scroll', onScroll, true)
    }
  }, [onScroll])

  function onClick() {
    if (!scrollRef || !scrollRef.current) {
      if (!ref.current) return

      const scrollContainer = scrollparent(ref.current)

      if (!scrollContainer) return

      scrollContainer.scrollTo(0, reverse ? scrollContainer.scrollHeight : 0)
    } else {
      scrollRef.current.scrollTo(
        0,
        reverse ? scrollRef.current.scrollHeight : 0,
      )
    }
  }

  return (
    <Button
      ref={ref}
      className={cn(
        'fixed w-14 h-14 rounded-full',
        !marginHorizontal && (right ? 'right-4' : 'left-4'),
        !marginVertical && (top ? 'top-4' : 'bottom-4 '),
        isInView && 'hidden',
      )}
      onClick={onClick}
      style={{
        ...(marginHorizontal
          ? right
            ? { right: marginHorizontal }
            : { left: marginHorizontal }
          : {}),
        ...(marginVertical
          ? top
            ? { top: marginVertical }
            : { bottom: marginVertical }
          : {}),
      }}
    >
      <ChevronUp className={cn(reverse && 'rotate-180')} size={28} />
    </Button>
  )
}
