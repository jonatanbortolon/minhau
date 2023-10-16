export function nameToInitials(name: string) {
  const nameArray = name.toUpperCase().split(' ')

  if (nameArray.length < 2) return nameArray[0][0] ?? ''

  const firstTwoNames = nameArray.slice(0, 2)

  return `${firstTwoNames[0][0]}${firstTwoNames[1][0] ?? ''}`
}
