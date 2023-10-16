'use client'

import 'leaflet/dist/leaflet.css'
import { useForm } from 'react-hook-form'
import { Form, FormDescription } from '../ui/form'
import { Button } from '../ui/button'
import { Loader2Icon } from 'lucide-react'
import { useToast } from '../ui/use-toast'
import { getApiUrl } from '@/utils/getApiUrl'
import { signOut } from 'next-auth/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'

export function DeleteUserFormComponent() {
  const { toast } = useToast()
  const form = useForm()

  const onSubmit = form.handleSubmit(async () => {
    try {
      const response = await fetch(`${getApiUrl()}/user/`, {
        method: 'DELETE',
      }).then((res) => res.json())

      if (!response.success) {
        if (!response.payload.input) {
          return toast({
            variant: 'destructive',
            title: 'Ops, algo deu errado!',
            description:
              'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
          })
        }

        return form.setError(response.payload.input, {
          message: response.payload.message,
        })
      }

      await signOut()
    } catch (error) {
      console.log(error)

      return toast({
        variant: 'destructive',
        title: 'Ops, algo deu errado!',
        description:
          'Parece que algo deu errado no servidor, tente novamente em alguns instantes!',
      })
    }
  })

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-destructive scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
        Perigo
      </h2>
      <div className="grid space-y-3">
        <span className="text-sm text-muted-foreground">
          Ao deleter sua conta você não terá mais acesso a ela e a nenhum dado!
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Deletar conta</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Deletar conta</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja deleter sua conta e seus dados?
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="mt-2 grid space-y-3">
                <DialogFooter>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={form.formState.isSubmitting}
                  >
                    Sim, tenho certeza
                    <Loader2Icon
                      className="ml-2 h-4 w-4 animate-spin hidden data-[show=true]:inline"
                      data-show={form.formState.isSubmitting}
                    />
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
