import { FiltersProvider } from '@/providers/filters'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export default async function Layout({ children }: Props) {
  return <FiltersProvider>{children}</FiltersProvider>
}
