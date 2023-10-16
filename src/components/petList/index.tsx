'use client'

import { usePetList } from '@/hooks/usePetList'
import { ListComponent } from '../list'
import { Card, CardContent, CardFooter } from '../ui/card'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { useFilters } from '@/hooks/useFilters'
import { ListItemComponent } from './listItem'
import { FiltersDialogComponent } from '../filtersDialog'
import { useHookWithRefCallback } from '@/hooks/useHookWithRefCallback'
import { ScrollToTopComponent } from '../scrollToTop'

export function PetListComponent() {
  const { filters } = useFilters()
  const {
    status,
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePetList({
    distance: filters.distance,
    sex: filters.sex,
    type: filters.type,
  })
  const inViewComponentRef = useHookWithRefCallback<HTMLButtonElement>()
  const headerHeight = 64 // px
  const componentTopffset = inViewComponentRef.current?.offsetTop ?? 0 // px

  return (
    <>
      <ListComponent
        pullToRefreshClassName="p-6"
        status={status}
        data={data}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        hasNextPage={hasNextPage ?? false}
        headerComponent={
          <div className="w-full flex flex-col my-8 px-6">
            <div className="w-full flex items-center justify-start mb-6">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Pets para adoção
              </h1>
            </div>
            <div className="w-full flex items-center justify-start">
              <FiltersDialogComponent
                ref={inViewComponentRef}
                excludeFilters={['name', 'adopted']}
              />
            </div>
          </div>
        }
        loadingComponent={
          <div className="w-full h-full p-6">
            <Card className="w-full">
              <CardContent className="p-0">
                <Skeleton className="w-full aspect-video" />
                <div className="w-full flex flex-col space-y-3 items-start justify-start p-6">
                  <Skeleton className="w-full h-7" />
                  <Skeleton className="w-full h-10" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="w-full h-5" />
              </CardFooter>
            </Card>
          </div>
        }
        errorComponent={
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-1/4 mb-4">
              <Image
                className="w-full aspect-square"
                src="/assets/images/sad-cat.png"
                width={200}
                height={200}
                alt="Gato triste"
              />
            </div>
            <span className="text-lg font-semibold text-center">
              Aconteceu um erro!
            </span>
            <span className="text-sm text-muted-foreground text-center">
              Tivemos um problema ao carregar os pets clique no botão abaixo
              para recarregar!
            </span>
            <Button className="w-full mt-4" onClick={() => refetch()}>
              Recarregar
            </Button>
          </div>
        }
        emptyComponent={
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-1/4 mb-4">
              <Image
                className="w-full aspect-square"
                src="/assets/images/sad-cat.png"
                width={200}
                height={200}
                alt="Gato triste"
              />
            </div>
            <span className="text-lg font-semibold">Vazio!!!</span>
            <span className="text-sm text-muted-foreground">
              Não conseguimos encontrar nenhum pet!
            </span>
          </div>
        }
        render={(pet) => <ListItemComponent key={pet.id} pet={pet} />}
      />
      <ScrollToTopComponent offset={headerHeight + componentTopffset} />
    </>
  )
}
