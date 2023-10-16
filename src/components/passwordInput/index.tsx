import { InputHTMLAttributes, useState } from 'react'
import { Input } from '../ui/input'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from '../ui/button'

type Props = InputHTMLAttributes<HTMLInputElement>

export function PasswordInputComponent(props: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={showPassword ? 'text' : 'password'} />
      <Button
        className="absolute top-0 right-0 bottom-0"
        variant="ghost"
        type="button"
        onClick={() => setShowPassword((old) => !old)}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}
