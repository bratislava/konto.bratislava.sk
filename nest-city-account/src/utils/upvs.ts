export const parseBirthNumberFromUri = (uri: string) => {
  const match = uri.match(/(?<=rc:\/\/sk\/)([^_]+)/)
  const parsedBirthNumber = match ? match[0] : null
  return parsedBirthNumber
}
