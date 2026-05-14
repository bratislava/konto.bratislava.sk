export const extractBirthNumberFromUri = (uri: string): string | undefined => {
  const parts = uri.split('_')[0].split('/')
  return parts.length > 0 ? parts[parts.length - 1] : undefined
}

export const extractIcoFromUri = (uri: string): string | undefined => {
  const parts = uri.split('/')
  return parts.length > 0 ? parts[parts.length - 1] : undefined
}
