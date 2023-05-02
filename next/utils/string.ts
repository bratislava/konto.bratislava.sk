export interface Args {
  [key: string]: string | number
}

export const formatUnicorn = (str: string, args: Args): string => {
  let formattedString: string = str

  Object.keys(args).forEach((key: string) => {
    formattedString = formattedString.replace(new RegExp(`\\{${key}\\}`, 'gi'), args[key].toString())
  })

  return formattedString
}
