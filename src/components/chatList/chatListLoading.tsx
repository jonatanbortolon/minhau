import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function ChatListLoadingComponent() {
  return (
    <div className="w-full h-full flex items-start justify-start">
      <Card className="w-full">
        <CardContent className="p-2">
          <div className="w-full flex items-center justify-start rounded-md">
            <Skeleton className="w-10 h-10 aspect-square" />
            <div className="w-full flex flex-col items-start justify-between ml-2 gap-2">
              <Skeleton className="w-full h-6" />
              <Skeleton className="w-full h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
