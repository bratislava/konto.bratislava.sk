import { TaxFormData } from '../../types';
export declare const parseDateFieldDate: (date: string | any) => Date | undefined;
export declare function getPocty(data: TaxFormData): {
    pocetPozemkov: 0;
    pocetStaviebJedenUcel: 0;
    pocetStaviebViacereUcely: 0;
    pocetBytov: 0;
};
export type ParsedRodneCislo = {
    isValid: true;
    firstPart: string;
    secondPart: string;
    value: string;
} | {
    isValid: false;
    value: string | undefined;
};
export declare function parseRodneCislo(rodneCisloOrBirthDate: string | undefined): ParsedRodneCislo;
export declare function parseBirthDate(rodneCisloOrBirthDate: string | any): Date | undefined;
