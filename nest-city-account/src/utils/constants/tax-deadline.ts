export function getTaxDeadlineDateString(): string {
  const year = new Date().getFullYear()
  return `${year}-01-03`
}
