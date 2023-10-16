'use client'

import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ListFilterIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { filtersSchema } from '@/schemas/filters'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Filters } from '@/types/filters'
import { Input } from '../ui/input'
import { useFilters } from '@/hooks/useFilters'
import { forwardRef } from 'react'

type Props = {
  excludeFilters?: Array<keyof Filters>
}

export const FiltersDialogComponent = forwardRef<HTMLButtonElement, Props>(
  ({ excludeFilters = [] }, ref) => {
    const { filters, setFilter } = useFilters()
    const form = useForm<z.infer<typeof filtersSchema>>({
      resolver: zodResolver(filtersSchema),
      defaultValues: filters,
    })

    const onSubmit = form.handleSubmit(
      ({ name, type, sex, distance, adopted }) => {
        setFilter('name', name)
        setFilter('sex', sex)
        setFilter('type', type)
        setFilter('distance', distance)
        setFilter('adopted', adopted)
      },
    )

    return (
      <Dialog>
        <DialogTrigger ref={ref}>
          <ListFilterIcon />
        </DialogTrigger>
        <DialogContent className="w-full h-full flex flex-col sm:max-w-[425px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Aqui você pode filtrar as caracteristicas do pet que deseja
              adotar.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="grid space-y-3">
              {!excludeFilters.includes('name') ? (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do pet</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Caso queira procurar um pet específico.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : null}
              {!excludeFilters.includes('type') ? (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'ALL' ? null : value)
                          }
                          value={field.value === null ? 'ALL' : field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="CAT">Gato</SelectItem>
                              <SelectItem value="DOG">Cachorro</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Qual animal deseja filtrar: cachorro ou gato?
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : null}
              {!excludeFilters.includes('sex') ? (
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'ALL' ? null : value)
                          }
                          value={field.value === null ? 'ALL' : field.value}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="FEMALE">Fêmea</SelectItem>
                              <SelectItem value="MALE">Macho</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Sexo do animal que deseja filtrar.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : null}
              {!excludeFilters.includes('distance') ? (
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distancia ({field.value} km)</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          min={1}
                          max={100}
                          step={1}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Que encontrar pets até quantos kilometros de você?
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : null}
              {!excludeFilters.includes('adopted') ? (
                <FormField
                  control={form.control}
                  name="adopted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situação</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'ALL' ? null : value)
                          }
                          value={
                            field.value === null
                              ? 'ALL'
                              : field.value
                              ? 'ADOPTED'
                              : 'NONADOPTED'
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="ALL">Todos</SelectItem>
                              <SelectItem value="ADOPTED">Adotado</SelectItem>
                              <SelectItem value="NONADOPTED">
                                Não adotado
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Procure por pets que ainda não foram adotados ou pelos
                        que ja foram.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : null}
              <DialogFooter>
                <Button type="submit">Aplicar filtro</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  },
)

FiltersDialogComponent.displayName = 'FiltersDialogComponent'
