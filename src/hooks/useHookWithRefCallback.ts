import { useState } from 'react'
import { useCallbackRef } from 'use-callback-ref'

export function useHookWithRefCallback<T extends HTMLElement>() {
  const [, forceUpdate] = useState<void>()

  const ref = useCallbackRef<T>(null, () => forceUpdate())

  return ref
}
