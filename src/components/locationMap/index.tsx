'use client'

import 'leaflet/dist/leaflet.css'
import type { LatLng, Map } from 'leaflet'
import { MapContainer } from 'react-leaflet'
import { ForwardedRef } from 'react'
import dynamic from 'next/dynamic'

const InnerLocationMapComponent = dynamic(
  async () => import('./inner').then((c) => c.InnerLocationMapComponent),
  {
    ssr: false,
  },
)

type Props = {
  mapRef?: ForwardedRef<Map>
  className?: string
  latitude: number
  longitude: number
  onCoordChange: (coord: LatLng) => void
}

export type LocationMapComponentRef = Map

export function LocationMapComponent({
  mapRef,
  className,
  onCoordChange,
  latitude,
  longitude,
}: Props) {
  return (
    <MapContainer
      ref={mapRef}
      className={className}
      center={{ lat: latitude, lng: longitude }}
      zoom={15}
    >
      <InnerLocationMapComponent onCoordChange={onCoordChange} />
    </MapContainer>
  )
}

LocationMapComponent.displayName = 'LocationMapComponent'
