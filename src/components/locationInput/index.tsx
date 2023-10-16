'use client'

import type { LatLng, Map } from 'leaflet'
import { debounce } from 'lodash'
import {
  useMemo,
  useRef,
  useState,
  ChangeEvent,
  forwardRef,
  ComponentProps,
} from 'react'
import { useEffectOnce, useUpdateEffect } from 'usehooks-ts'
import { Input } from '../ui/input'
import { MapPinIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { LocationMapComponentRef } from '@/components/locationMap'

const LocationMapComponentWithouRef = dynamic(
  async () =>
    import('@/components/locationMap').then((c) => c.LocationMapComponent),
  {
    ssr: false,
  },
)

const LocationMapComponent = forwardRef<
  LocationMapComponentRef,
  Omit<ComponentProps<typeof LocationMapComponentWithouRef>, 'mapRef'>
>((props, ref) => <LocationMapComponentWithouRef {...props} mapRef={ref} />)

LocationMapComponent.displayName = 'LocationMapComponent'

type Props = {
  value: {
    latitude: number
    longitude: number
  }
  error?: string | null
  onChange: (value: Props['value']) => void
}

export function LocationInputComponent({ value, error, onChange }: Props) {
  const mapRef = useRef<Map | null>(null)
  const [address, setAddress] = useState('')
  const [isAddressFetchLoading, setIsAddressFetchLoading] = useState(false)
  const addressFetchController = useRef<AbortController | null>(null)
  const [isAddressSearchFocused, setIsAddressSearchFocused] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<
    Array<{
      displayName: string
      lat: number
      lng: number
    }>
  >([])

  const debounceOnChangeAddress = useMemo(
    () =>
      debounce((address: string) => {
        if (addressFetchController.current) {
          addressFetchController.current.abort()
        }

        setIsAddressFetchLoading(true)

        const controller = new AbortController()

        addressFetchController.current = controller

        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&accept-language=pt-BR&countrycodes=br&limit=5&q=${address}`,
          {
            signal: addressFetchController.current.signal,
          },
        )
          .then((res) => {
            addressFetchController.current = null

            return res.json()
          })
          .then((res) => {
            setIsAddressFetchLoading(false)

            const formatedResponse = res.map(
              (suggestion: {
                display_name: string
                lat: string
                lon: string
              }) => ({
                displayName: suggestion.display_name,
                lat: parseFloat(suggestion.lat),
                lng: parseFloat(suggestion.lon),
              }),
            )

            setAddressSuggestions(formatedResponse)
          })
      }, 1000),
    [],
  )

  useUpdateEffect(() => {
    if (address === '') {
      return setAddressSuggestions([])
    }

    debounceOnChangeAddress(address)
  }, [address])

  useEffectOnce(() => {
    if (!window) return

    async function fetchFirstLocation() {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=pt-BR&lat=${value.latitude}&lon=${value.longitude}`,
        ).then((res) => res.json())

        setAddress(response.display_name)
      } catch (error) {
        console.log(error)
      } finally {
        setIsAddressFetchLoading(false)
      }
    }

    fetchFirstLocation()
  })

  function onAddressChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    setAddress(value)
  }

  function onSuggestionClick(suggestion: {
    displayName: string
    lat: number
    lng: number
  }) {
    return () => {
      if (mapRef.current) {
        mapRef.current.flyTo([suggestion.lat, suggestion.lng], 15, {
          animate: true,
          duration: 1,
        })

        onChange({
          latitude: suggestion.lat,
          longitude: suggestion.lng,
        })

        setAddress(suggestion.displayName)
      }
    }
  }

  function onAddressInputFocus() {
    setIsAddressSearchFocused(true)
  }

  function onAddressInputBlur() {
    setIsAddressSearchFocused(false)
  }

  function onCoordChange(coord: LatLng) {
    onChange({
      latitude: coord.lat,
      longitude: coord.lng,
    })
  }

  return (
    <div>
      <div
        className="relative mb-3 z-50"
        onFocus={onAddressInputFocus}
        onBlur={onAddressInputBlur}
      >
        <Input
          className={error ? 'border-destructive' : undefined}
          value={address}
          onChange={onAddressChange}
        />
        <div
          className="w-full absolute top-[calc(100%+8px)] hidden data-[show=true]:flex flex-col rounded-md border bg-background"
          data-show={isAddressSearchFocused}
        >
          {isAddressFetchLoading ? (
            <span className="mx-auto my-2">Carregando...</span>
          ) : null}
          {!isAddressFetchLoading && !addressSuggestions.length ? (
            <span className="mx-auto my-2">Nenhum endereço encontrado.</span>
          ) : null}
          {!isAddressFetchLoading
            ? addressSuggestions.map((suggestion, index) => (
                <div
                  key={`address-${index}`}
                  className="w-full py-1.5 px-8 rounded-md cursor-default hover:bg-accent hover:text-accent-foreground pointer-events-auto"
                  onMouseDown={onSuggestionClick(suggestion)}
                >
                  <span className="max-w-full whitespace-normal">
                    {suggestion.displayName}
                  </span>
                </div>
              ))
            : null}
        </div>
      </div>
      <div className="w-full aspect-square relative">
        <div className="absolute left-0 right-0 top-0 bottom-0 grid place-items-center pointer-events-none z-[45]">
          <MapPinIcon size={32} className="text-black translate-y-1/2" />
        </div>
        <LocationMapComponent
          ref={mapRef}
          className="w-full aspect-square z-40"
          latitude={value.latitude}
          longitude={value.longitude}
          onCoordChange={onCoordChange}
        />
      </div>
    </div>
  )
}
