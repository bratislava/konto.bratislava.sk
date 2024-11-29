/**
 * Converts a Date object to a xs:date (e.g. `2021-01-01+01:00`) formatted string.
 */
export declare const formatXsDateXml: (date: Date | undefined) => string | undefined;
/**
 * Converts a Date object to a xs:dateTime (e.g. `2021-01-01T00:00:00.000+01:00`) formatted string.
 */
export declare const formatXsDateTimeXml: (date: Date | undefined) => string | undefined;
export declare const formatIntegerXml: (value: number | undefined | null) => string | undefined;
export declare const formatDecimalXml: (value: number | undefined | null) => string | undefined;
/**
 * In the form, the user provides the phone number in E.164 format, however the XML expects the phone number to be split
 * into 3 parts. This function tries to parse the phone number and split it into expected parts to satisfy the strict
 * XML requirements.
 *
 * Working with phone numbers is extremely hard - https://github.com/google/libphonenumber/blob/master/FALSEHOODS.md
 * That's the reason, this function is written in the most defensive way possible.
 */
export declare const phoneNumberXml: (value: string | undefined | null) => {
    MedzinarodneVolacieCislo: string;
    Predvolba: string;
    Cislo: string;
} | undefined;
