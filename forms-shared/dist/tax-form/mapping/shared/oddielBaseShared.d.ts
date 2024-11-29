import { DanZBytovANebytovychPriestorovPriznanie, DanZoStaviebJedenUcelPriznania, DanZoStaviebViacereUcelyPriznania, DanZPozemkovPriznania, TaxFormData } from '../../types';
export declare const oddielBaseShared: (data: TaxFormData, priznanie: DanZPozemkovPriznania | DanZoStaviebJedenUcelPriznania | DanZoStaviebViacereUcelyPriznania | DanZBytovANebytovychPriestorovPriznanie, isBytyANebytovePriestory?: boolean) => {
    obec: string;
    isVlastnik: boolean;
    isSpravca: boolean;
    isNajomca: boolean;
    isUzivatel: boolean;
    isPodieloveSpoluvlastnictvo: boolean;
    isBezpodieloveSpoluvlastnictvo: boolean;
    spoluvlastnikUrcenyDohodou: boolean | undefined;
    pocetSpoluvlastnikov: number | undefined;
    rodneCisloManzelaManzelky: import("./functions").ParsedRodneCislo | undefined;
};
