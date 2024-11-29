import { DanZPozemkovPriznania, TaxFormData } from '../../types';
declare const mapPriznanie: (data: TaxFormData, priznanie: DanZPozemkovPriznania) => {
    hodnotaUrcenaZnaleckymPosudkom: boolean;
    pozemky: {
        katastralneUzemie: "Čunovo" | "Devín" | "Devínska Nová Ves" | "Dúbravka" | "Jarovce" | "Karlova Ves" | "Lamač" | "Nivy" | "Nové Mesto" | "Petržalka" | "Podunajské Biskupice" | "Rača" | "Rusovce" | "Ružinov" | "Staré Mesto" | "Trnávka" | "Vajnory" | "Vinohrady" | "Vrakuňa" | "Záhorská Bystrica" | undefined;
        cisloParcely: string | undefined;
        druhPozemku: string | undefined;
        sposobVyuzitiaPozemku: string | undefined;
        datumVznikuDanovejPovinnosti: Date | undefined;
        datumZanikuDanovejPovinnosti: Date | undefined;
        vymeraPozemku: number | null | undefined;
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
export type Oddiel2PriznanieShared = ReturnType<typeof mapPriznanie>;
export declare const oddiel2Shared: (data: TaxFormData) => {
    hodnotaUrcenaZnaleckymPosudkom: boolean;
    pozemky: {
        katastralneUzemie: "Čunovo" | "Devín" | "Devínska Nová Ves" | "Dúbravka" | "Jarovce" | "Karlova Ves" | "Lamač" | "Nivy" | "Nové Mesto" | "Petržalka" | "Podunajské Biskupice" | "Rača" | "Rusovce" | "Ružinov" | "Staré Mesto" | "Trnávka" | "Vajnory" | "Vinohrady" | "Vrakuňa" | "Záhorská Bystrica" | undefined;
        cisloParcely: string | undefined;
        druhPozemku: string | undefined;
        sposobVyuzitiaPozemku: string | undefined;
        datumVznikuDanovejPovinnosti: Date | undefined;
        datumZanikuDanovejPovinnosti: Date | undefined;
        vymeraPozemku: number | null | undefined;
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
