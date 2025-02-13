export function getTaxDeadlineDateString(): string {
  const year = new Date().getFullYear()
  return `${year}-04-01 00:00:00`
}
