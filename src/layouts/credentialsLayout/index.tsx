import './index.css'
import { CompactThemeSwitcherComponent } from '@/components/compactThemeSwitcher'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export const dynamic = 'force-dynamic'

export function CredentialsLayout({ children }: Props) {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-start px-6 mt-6 mb-8">
        {children}
      </div>
      <div className="w-full flex items-center justify-start mt-auto px-6 mb-6">
        <CompactThemeSwitcherComponent />
      </div>
    </>
  )
}
