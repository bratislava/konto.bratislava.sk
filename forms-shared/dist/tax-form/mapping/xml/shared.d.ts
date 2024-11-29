import { ParsedRodneCislo } from '../shared/functions';
import { TaxFormData } from '../../types';
export declare const formatRodneCisloXml: (parsedRodneCislo: ParsedRodneCislo | undefined) => string | undefined;
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
export declare function parseUlicaACisloDomu(ulicaACisloDomu: string | undefined): {
    Ulica: string;
    OrientacneCislo: string;
} | {
    Ulica: string;
    OrientacneCislo?: undefined;
} | undefined;
export declare const sharedPriznanieXml: (data: TaxFormData) => {
    RodneCislo: string | undefined;
    ICO: string | undefined;
};
