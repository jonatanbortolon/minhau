import { PetAdopted } from '@/enums/petAdopted'
import { PetSex, PetType } from '@prisma/client'
import { omit } from 'lodash'

export function getFilters(
  requestUrl: string,
  except?: ('name' | 'page' | 'type' | 'sex' | 'adopted' | 'distance')[],
) {
  const url = new URL(requestUrl)

  let page = parseInt(url.searchParams.get('page') || '0')

  if (page < 0 || isNaN(page)) {
    page = 0
  }

  const name = url.searchParams.get('name')
  const sex =
    url.searchParams.get('sex') === null
      ? null
      : url.searchParams.get('sex') === PetSex.FEMALE ||
        url.searchParams.get('sex') === PetSex.MALE
      ? url.searchParams.get('sex')
      : null
  const type =
    url.searchParams.get('type') === null
      ? null
      : url.searchParams.get('type') === PetType.CAT ||
        url.searchParams.get('type') === PetType.DOG
      ? url.searchParams.get('type')
      : null
  const distance = parseInt(url.searchParams.get('distance') || '5')
  const adopted =
    url.searchParams.get('adopted') === null
      ? null
      : url.searchParams.get('adopted') === PetAdopted.ADOPTED ||
        url.searchParams.get('adopted') === PetAdopted.NONADOPTED
      ? url.searchParams.get('adopted')
      : null

  const allFilters = {
    page,
    name,
    sex,
    type,
    distance,
    adopted,
  }

  return omit(allFilters, ...(except ?? []))
}
