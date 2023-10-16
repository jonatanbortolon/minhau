'use client'

import { useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

export function useGeolocation() {
  const [latitute, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [error, setError] = useState<GeolocationPositionError | null>(null)

  function onEvent(event: GeolocationPosition) {
    setLatitude(event.coords.latitude)
    setLongitude(event.coords.longitude)
  }

  function onError(error: GeolocationPositionError) {
    setError(error)
  }

  useEffectOnce(() => {
    navigator.geolocation.getCurrentPosition(onEvent, onError)
  })

  return [latitute, longitude, error] as const
}
