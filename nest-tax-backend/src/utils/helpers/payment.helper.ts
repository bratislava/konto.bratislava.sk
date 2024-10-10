export const computeIsPayableYear = (year: number): boolean => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  return year === currentYear
}
