import { cookies } from 'next/headers'

export function getServerTheme() {
  const theme = cookies().get('theme')?.value ?? 'system'

  if (theme !== 'light' && theme !== 'dark' && theme !== 'system')
    return 'system'

  return theme
}
