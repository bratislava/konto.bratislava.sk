import { DanZoStaviebJedenUcelPriznania, TaxFormData } from '../../types';
declare const mapPriznanie: (data: TaxFormData, priznanie: DanZoStaviebJedenUcelPriznania) => {
    ulicaACisloDomu: string | undefined;
    supisneCislo: number | undefined;
    katastralneUzemie: "Čunovo" | "Devín" | "Devínska Nová Ves" | "Dúbravka" | "Jarovce" | "Karlova Ves" | "Lamač" | "Nivy" | "Nové Mesto" | "Petržalka" | "Podunajské Biskupice" | "Rača" | "Rusovce" | "Ružinov" | "Staré Mesto" | "Trnávka" | "Vajnory" | "Vinohrady" | "Vrakuňa" | "Záhorská Bystrica" | undefined;
    cisloParcely: string | undefined;
    datumVznikuDanovejPovinnosti: Date | undefined;
    datumZanikuDanovejPovinnosti: Date | undefined;
    predmetDane: import("../../types").PredmetDane | undefined;
    zakladDane: number | null | undefined;
    pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: number | undefined;
    celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby: number | undefined;
    vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: number | undefined;
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
export type Oddiel3JedenUcelPriznanieShared = ReturnType<typeof mapPriznanie>;
export declare const oddiel3JedenUcelShared: (data: TaxFormData) => {
    ulicaACisloDomu: string | undefined;
    supisneCislo: number | undefined;
    katastralneUzemie: "Čunovo" | "Devín" | "Devínska Nová Ves" | "Dúbravka" | "Jarovce" | "Karlova Ves" | "Lamač" | "Nivy" | "Nové Mesto" | "Petržalka" | "Podunajské Biskupice" | "Rača" | "Rusovce" | "Ružinov" | "Staré Mesto" | "Trnávka" | "Vajnory" | "Vinohrady" | "Vrakuňa" | "Záhorská Bystrica" | undefined;
    cisloParcely: string | undefined;
    datumVznikuDanovejPovinnosti: Date | undefined;
    datumZanikuDanovejPovinnosti: Date | undefined;
    predmetDane: import("../../types").PredmetDane | undefined;
    zakladDane: number | null | undefined;
    pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: number | undefined;
    celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby: number | undefined;
    vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: number | undefined;
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