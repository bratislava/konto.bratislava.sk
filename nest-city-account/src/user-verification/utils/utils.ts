export const extractBirthNumberFromUri = (uri: string): string | undefined => {
  return uri.split('_')[0].split('/').at(-1)
}

export const extractIcoFromUri = (uri: string): string | undefined => {
  return uri.split('/').at(-1)
}
