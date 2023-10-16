'use client'

import { TileLayer, useMapEvent } from 'react-leaflet'
import { LatLng, type LeafletEvent } from 'leaflet'

type Props = {
  onCoordChange: (coord: LatLng) => void
}

export function InnerLocationMapComponent({ onCoordChange }: Props) {
  useMapEvent('moveend', onMoveEnd)

  function onMoveEnd(event: LeafletEvent) {
    const center = event.target.getCenter()

    const newCoord = new LatLng(center.lat, center.lng)

    onCoordChange(newCoord)
  }

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  )
}
