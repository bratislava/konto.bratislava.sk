export function addSlashToBirthNumber(birthNumber: string): string {
  const birthNumberRegex = /^\d{6}\/?\d{3,4}$/
  if (!birthNumberRegex.test(birthNumber)) {
    throw new Error(
      `ERROR - Status-500: Invalid birth number passed to addSlashToBirthNumber ${birthNumber}`,
    )
  }
  return birthNumber.includes('/')
    ? birthNumber
    : `${birthNumber.slice(0, 6)}/${birthNumber.slice(6)}`
}
