import currency from 'currency.js'

export const convertCurrencyToInt = (value: string): number => {
  return currency(value.replace(',', '.')).intValue
}
