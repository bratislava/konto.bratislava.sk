import { ParsedRodneCislo } from '../shared/functions'
import { udajeODanovnikoviShared } from '../shared/udajeODanovnikoviShared'
import { TaxFormData } from '../../types'

export const formatRodneCisloXml = (parsedRodneCislo: ParsedRodneCislo | undefined) => {
  if (!parsedRodneCislo?.isValid) {
    return undefined
  }

  return `${parsedRodneCislo.firstPart}${parsedRodneCislo.secondPart}`
}

/**
 * Parses the input string to extract street name and orientation number.
 *
 * The input should consist of two parts separated by a space:
 * - The first part (Ulica) can be any string (street name).
 * - The second part (OrientacneCislo) should be a number that can be followed
 *   by either a single letter (uppercase or lowercase) or a slash and a single letter.
 *
 *
 * @example
 * parseStreetAndNumber("Main Street 123"); // { Ulica: "Main Street", OrientacneCislo: "123" }
 * parseStreetAndNumber("Oak Road 456B"); // { Ulica: "Oak Road", OrientacneCislo: "456B" }
 * parseStreetAndNumber("Pine Avenue 789/G"); // { Ulica: "Pine Avenue", OrientacneCislo: "789/G" }
 * parseStreetAndNumber("Willow Lane 85a") // { Ulica: 'Willow Lane', OrientacneCislo: '85a' }
 * parseStreetAndNumber("Maple Street 123 Apartment 2"); // { "Ulica": "Maple Street 123 Apartment", "OrientacneCislo": "2" }
 * parseStreetAndNumber("123 Maple Street"); // { Ulica: "123 Maple Street" }
 */
export function parseUlicaACisloDomu(ulicaACisloDomu: string | undefined) {
  if (!ulicaACisloDomu) {
    return undefined
  }

  const regex = /^(.+)\s(\d+([A-Za-z]|\/[A-Za-z])?)$/
  const match = ulicaACisloDomu.match(regex)

  if (match) {
    return { Ulica: match[1], OrientacneCislo: match[2] }
  }
  return { Ulica: ulicaACisloDomu }
}

export const sharedPriznanieXml = (data: TaxFormData) => {
  const mapping = udajeODanovnikoviShared(data)

  return {
    RodneCislo: formatRodneCisloXml(mapping.rodneCislo),
    ICO: mapping.ico,
  }
}
