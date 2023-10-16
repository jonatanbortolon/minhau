import { useLocalStorage } from 'usehooks-ts'

export function useNotification() {
  const [notifications, setNotifications] = useLocalStorage(
    'minhau-notifications',
    true,
  )

  return {
    enabled: notifications,
    setNotifications,
  }
}
