import { RfoIdentityListElement } from '../../rfo-by-birthnumber/dtos/rfoSchema'

const parseName = (name: string) => {
  return name
    .replace(/,.*/, '')
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export const parseUriNameFromRfo = (rfo: RfoIdentityListElement) => {
  const firstName = rfo.menaOsoby
    ?.sort((a, b) => {
      return (a.poradieMena ?? 0) - (b.poradieMena ?? 0)
    })
    .map((meno) => meno.meno)
    .join('')
  const lastName = rfo.priezviskaOsoby
    ?.sort((a, b) => {
      return (a.poradiePriezviska ?? 0) - (b.poradiePriezviska ?? 0)
    })
    .map((meno) => meno.meno)
    .join('')
  if (!firstName || !lastName) return null

  const processedFamilyName = parseName(lastName)
  const processedGivenName = parseName(firstName)

  return `${processedFamilyName}_${processedGivenName}`
}
