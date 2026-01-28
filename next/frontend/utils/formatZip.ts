export const formatZip = (zip?: string) => {
  if (!zip) return null

  // Example: '84104' -> '841 04'
  if (/^\d{5}$/g.test(zip)) {
    return `${zip.slice(0, 3)} ${zip.slice(3)}`
  }

  return zip
}
