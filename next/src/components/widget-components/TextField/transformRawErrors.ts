export const transformRawErrors = (errors: string[] | null | undefined) => {
  return !errors?.length
    ? undefined
    : errors.reduce((prev, currentValue) => prev.concat(currentValue), '')
}
