export const extractBirthNumberFromUri = (uri: string): string => {
  return uri.split('_')[0].split('/').at(-1)!
}

export const extractIcoFromUri = (uri: string): string => {
  return uri.split('/').at(-1)!
}
