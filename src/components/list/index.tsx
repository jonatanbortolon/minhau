'use client'

import { Loader2Icon } from 'lucide-react'
import { ReactNode, useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { PullToRefreshComponent } from '../pullToRefresh'
import { cn } from '@/libs/utils'

type Props<T> = {
  pullToRefreshClassName?: string
  data: Array<T>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  refetch: () => void
  status: 'loading' | 'error' | 'success'
  render: (data: T) => ReactNode
  headerComponent?: ReactNode
  loadingComponent: ReactNode
  errorComponent: ReactNode
  emptyComponent: ReactNode
}

export function ListComponent<T>({
  pullToRefreshClassName,
  data,
  fetchNextPage,
  hasNextPage,
  refetch,
  isFetchingNextPage,
  status,
  render,
  headerComponent,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: Props<T>) {
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  const memoItems = useMemo(() => data.map(render), [data, render])

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
      {headerComponent}
      {status === 'loading' ? (
        loadingComponent
      ) : status === 'error' ? (
        errorComponent
      ) : (
        <PullToRefreshComponent
          className={cn(
            'w-full flex-1 justify-start gap-6',
            pullToRefreshClassName,
          )}
          onRefresh={async () => refetch()}
        >
          {!data.length ? emptyComponent : null}
          {memoItems}
          <div
            ref={ref}
            className="w-full min-h-[1px] mt-4 flex items-center justify-center bg-transparent pointer-events-none"
          >
            <Loader2Icon
              size={24}
              className="animate-spin hidden data-[show=true]:inline"
              data-show={
                isFetchingNextPage /* || (isFetching && !isFetchingNextPage) */
              }
            />
          </div>
        </PullToRefreshComponent>
      )}
    </div>
  )
}
