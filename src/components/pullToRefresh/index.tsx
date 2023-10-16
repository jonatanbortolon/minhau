'use client'

import './index.css'
import { ArrowUpIcon, Loader2Icon } from 'lucide-react'
import { useEffect, PropsWithChildren, useCallback, useState } from 'react'
import PullToRefresh from 'pulltorefreshjs'
import ReactDOMServer from 'react-dom/server'
import { cn } from '@/libs/utils'
import scrollparent from 'scrollparent'
import { useHookWithRefCallback } from '@/hooks/useHookWithRefCallback'

type Props = PropsWithChildren<{
  className?: string
  onRefresh: () => Promise<void>
}>

export function PullToRefreshComponent({
  className,
  children,
  onRefresh,
}: Props) {
  const ref = useHookWithRefCallback<HTMLDivElement>()
  const [shouldPullToRefresh, setShouldPullToRefresh] = useState(true)

  const shouldPullToRefreshCallback = useCallback(
    () => shouldPullToRefresh,
    [shouldPullToRefresh],
  )

  const onScollCallback = useCallback(() => {
    if (!ref.current) return

    const pullToRefreshParentScrollElement = scrollparent(ref.current)

    setShouldPullToRefresh(
      !(pullToRefreshParentScrollElement
        ? pullToRefreshParentScrollElement.scrollTop
        : ref.current.scrollTop),
    )
  }, [ref])

  useEffect(() => {
    document.addEventListener('scroll', onScollCallback, true)
    return () => {
      document.removeEventListener('scroll', onScollCallback, true)
    }
  }, [onScollCallback])

  useEffect(() => {
    const ptr = PullToRefresh.init({
      mainElement: '#pullrefresh',
      iconArrow: ReactDOMServer.renderToString(
        <div className="w-full text-inherit grid place-items-center">
          <ArrowUpIcon />
        </div>,
      ),
      iconRefreshing: ReactDOMServer.renderToString(
        <div className="w-full grid place-items-center">
          <Loader2Icon className="text-inherit animate-spin" />
        </div>,
      ),
      instructionsPullToRefresh: ' ',
      instructionsReleaseToRefresh: ' ',
      instructionsRefreshing: ' ',
      onRefresh,
      triggerElement: '#pullrefresh',
      shouldPullToRefresh: shouldPullToRefreshCallback,
    })

    return () => {
      ptr.destroy()
    }
  }, [onRefresh, shouldPullToRefreshCallback])

  return (
    <>
      <style jsx global>
        {`
          .ptr--ptr {
            box-shadow: none !important;
          }
        `}
      </style>
      <div
        ref={ref}
        id="pullrefresh"
        className={cn(
          'w-full h-full flex flex-col items-start justify-center',
          className,
        )}
      >
        {children}
      </div>
    </>
  )
}
