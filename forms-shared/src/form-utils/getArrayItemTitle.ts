export const getArrayItemTitle = (title: string | undefined, index: number) =>
  (title ?? '').replace('{index}', String(index + 1))
