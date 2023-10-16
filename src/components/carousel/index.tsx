import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'
import Image from 'next/image'

type Props = {
  images: Array<{
    path: string
  }>
}

export function CarouselComponent({ images }: Props) {
  return (
    <Carousel className="w-full aspect-video" showThumbs={false}>
      {images.map((image, index) => (
        <div key={`image-${index}`} className="relative w-full aspect-video">
          <div className="absolute inset-0">
            <Image
              className="rounded-lg object-contain"
              src={image.path}
              alt={`Imagem ${index}`}
              fill
            />
          </div>
        </div>
      ))}
    </Carousel>
  )
}
