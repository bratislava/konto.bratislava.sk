import { DanZBytovANebytovychPriestorovPriznanie, TaxFormData } from '../../types';
declare const mapPriznanie: (data: TaxFormData, priznanie: DanZBytovANebytovychPriestorovPriznanie) => {
    ulicaACisloDomu: string | undefined;
    supisneCislo: number | undefined;
    katastralneUzemie: "Čunovo" | "Devín" | "Devínska Nová Ves" | "Dúbravka" | "Jarovce" | "Karlova Ves" | "Lamač" | "Nivy" | "Nové Mesto" | "Petržalka" | "Podunajské Biskupice" | "Rača" | "Rusovce" | "Ružinov" | "Staré Mesto" | "Trnávka" | "Vajnory" | "Vinohrady" | "Vrakuňa" | "Záhorská Bystrica" | undefined;
    cisloParcely: string | undefined;
    byt: {
        cisloBytu: string | undefined;
        popisBytu: string | undefined;
        datumVznikuDanovejPovinnosti: Date | undefined;
        datumZanikuDanovejPovinnosti: Date | undefined;
        zakladDane: number | null | undefined;
        vymeraPodlahovejPlochyNaIneUcely: number | undefined;
    } | null;
    nebytovePriestory: {
        cisloNebytovehoPriestoruVBytovomDome: string | undefined;
        ucelVyuzitiaNebytovehoPriestoruVBytovomDome: string | undefined;
        datumVznikuDanovejPovinnosti: Date | undefined;
        datumZanikuDanovejPovinnosti: Date | undefined;
        vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome: number | null | undefined;
    }[];
    poznamka: string;
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
export type Oddiel4PriznanieShared = ReturnType<typeof mapPriznanie>;
export declare const oddiel4Shared: (data: TaxFormData) => {
    ulicaACisloDomu: string | undefined;
    supisneCislo: number | undefined;
    katastralneUzemie: "Čunovo" | "Devín" | "Devínska Nová Ves" | "Dúbravka" | "Jarovce" | "Karlova Ves" | "Lamač" | "Nivy" | "Nové Mesto" | "Petržalka" | "Podunajské Biskupice" | "Rača" | "Rusovce" | "Ružinov" | "Staré Mesto" | "Trnávka" | "Vajnory" | "Vinohrady" | "Vrakuňa" | "Záhorská Bystrica" | undefined;
    cisloParcely: string | undefined;
    byt: {
        cisloBytu: string | undefined;
        popisBytu: string | undefined;
        datumVznikuDanovejPovinnosti: Date | undefined;
        datumZanikuDanovejPovinnosti: Date | undefined;
        zakladDane: number | null | undefined;
        vymeraPodlahovejPlochyNaIneUcely: number | undefined;
    } | null;
    nebytovePriestory: {
        cisloNebytovehoPriestoruVBytovomDome: string | undefined;
        ucelVyuzitiaNebytovehoPriestoruVBytovomDome: string | undefined;
        datumVznikuDanovejPovinnosti: Date | undefined;
        datumZanikuDanovejPovinnosti: Date | undefined;
        vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome: number | null | undefined;
    }[];
    poznamka: string;
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
}[];
export {};
