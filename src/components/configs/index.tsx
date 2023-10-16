'use client'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select'
import { useTheme } from '@/hooks/useTheme'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { useNotification } from '@/hooks/useNotification'
import { ThemeContext } from '@/contexts/theme'

export function ConfigsComponent() {
  const { theme, changeTheme } = useTheme()
  const { enabled: notificationsEnabled, setNotifications } = useNotification()

  function onThemeChange(value: string) {
    changeTheme(value as ThemeContext['theme'])
  }

  return (
    <div className="w-full grid space-y-8">
      <div className="w-full flex flex-col gap-2">
        <Label>Tema</Label>
        <Select defaultValue={theme} onValueChange={onThemeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Tema que deseja usar nesse aparelho.
        </p>
      </div>
      <div className="w-full flex gap-2">
        <div className="w-full flex flex-col gap-2 items-start justify-between">
          <Label>Notificações</Label>
          <p className="text-sm text-muted-foreground">
            Deseja receber notificaçoes nesse aparelho?
          </p>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={setNotifications}
        />
      </div>
    </div>
  )
}
