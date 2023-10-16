import { PetAdopted } from '@/enums/petAdopted'
import { PetSex, PetType } from '@prisma/client'

export type Filters = {
  name: string | null
  distance: number
  adopted: PetAdopted | null
  sex: PetSex | null
  type: PetType | null
}
