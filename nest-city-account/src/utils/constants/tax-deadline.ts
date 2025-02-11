export function getTaxDeadlineDateString(): string {
  const year = new Date().getFullYear()
  return `${year}-03-02 00:00:00`
}
