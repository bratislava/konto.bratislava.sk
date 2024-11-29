export declare const baTimeRegex: RegExp;
/**
 * Compares two time strings in format HH:MM.
 *
 * Copied from: https://github.com/ajv-validator/ajv-formats/blob/4dd65447575b35d0187c6b125383366969e6267e/src/formats.ts#L180C1-L186C2
 */
declare function compareBaTime(s1: string, s2: string): number | undefined;
export declare const baPhoneNumberRegex: RegExp;
export declare const baSlovakPhoneNumberRegex: RegExp;
export declare const parseRatio: (value: string) => {
    isValid: boolean;
    numerator?: undefined;
    denominator?: undefined;
} | {
    isValid: boolean;
    numerator: number;
    denominator: number;
};
export declare const validateBaFileUuid: (value: unknown) => value is string;
declare const baAjvInputFormats: {
    'ba-slovak-zip': RegExp;
    'ba-phone-number': RegExp;
    'ba-slovak-phone-number': RegExp;
    'ba-ratio': {
        validate: (value: string) => boolean;
    };
    'ba-ico': RegExp;
    'ba-iban': {
        validate: (value: string) => boolean;
    };
};
export type BaAjvInputFormat = keyof typeof baAjvInputFormats;
export declare const baAjvFormats: {
    'ba-time': {
        validate: RegExp;
        compare: typeof compareBaTime;
    };
    'ba-file-uuid': {
        validate: (value: unknown) => value is string;
    };
    'ba-slovak-zip': RegExp;
    'ba-phone-number': RegExp;
    'ba-slovak-phone-number': RegExp;
    'ba-ratio': {
        validate: (value: string) => boolean;
    };
    'ba-ico': RegExp;
    'ba-iban': {
        validate: (value: string) => boolean;
    };
};
export {};
