export const parseName = (name: string) => {
  return name
    .replace(/,.*/, '')
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}
