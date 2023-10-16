import { headers } from 'next/headers'

export function cloneHeaders() {
  const newHeaders = new Headers()

  headers().forEach((value, key) => newHeaders.append(key, value))

  return newHeaders
}
