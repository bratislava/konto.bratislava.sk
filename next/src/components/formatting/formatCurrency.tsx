import { useNumberFormatter } from 'react-aria'

export const useCurrencyFormatter = () =>
  useNumberFormatter({
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })

export const FormatCurrency = ({ value }: { value: number }) => {
  const currencyFormatter = useCurrencyFormatter()

  // Convert value from cents to euros
  const valueInEuros = value / 100

  return <>{currencyFormatter.format(valueInEuros)}</>
}

export const useCurrencyFromCentsFormatter = () => {
  const currencyFormatter = useCurrencyFormatter()

  return {
    format: (value: number) => currencyFormatter.format(value / 100),
  }
}

export const FormatCurrencyFromCents = ({ value }: { value: number }) => {
  const currencyFormatter = useCurrencyFromCentsFormatter()

  return <>{currencyFormatter.format(value)}</>
}
