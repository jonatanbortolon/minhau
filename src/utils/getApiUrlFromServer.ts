import { headers } from 'next/headers'

export function getApiUrlFromServer() {
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const host = headers().get('host')

  return `${protocol}://${host}/api`
}
