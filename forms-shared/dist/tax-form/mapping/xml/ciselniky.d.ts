import { Ciselnik, CiselnikType } from '../shared/esbsCiselniky';
type RecordWithKeysFromCiselnik<T extends Ciselnik[]> = {
    [P in T[number]['Code']]?: boolean;
};
export declare function getCiselnikEntryByCondition<T extends CiselnikType>(ciselnik: T | Readonly<T>, record: RecordWithKeysFromCiselnik<T>): Ciselnik | null | undefined;
export declare function getCiselnikEntryByCode<T extends CiselnikType>(ciselnik: T | Readonly<T>, code: string | undefined): Ciselnik | undefined;
export declare const pravnyVztah: (priznanie: {
    isVlastnik?: boolean;
    isSpravca?: boolean;
    isNajomca?: boolean;
    isUzivatel?: boolean;
}) => Ciselnik | null | undefined;
export declare const spoluvlastnictvo: (priznanie: {
    isPodieloveSpoluvlastnictvo?: boolean;
    isBezpodieloveSpoluvlastnictvo?: boolean;
}) => Ciselnik | null | undefined;
export declare const katastralneUzemie: (katastralneUzemieString: string | undefined) => {
    readonly Code: "805301";
    readonly Name: "Devín";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "810649";
    readonly Name: "Devínska Nová Ves";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "806099";
    readonly Name: "Dúbravka";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "822256";
    readonly Name: "Jarovce";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "805211";
    readonly Name: "Karlova Ves";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "806005";
    readonly Name: "Lamač";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "804274";
    readonly Name: "Nivy";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "804690";
    readonly Name: "Nové Mesto";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "804959";
    readonly Name: "Petržalka";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "847755";
    readonly Name: "Podunajské Biskupice";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "805866";
    readonly Name: "Rača";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "853771";
    readonly Name: "Rusovce";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "805556";
    readonly Name: "Ružinov";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "804096";
    readonly Name: "Staré Mesto";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "805343";
    readonly Name: "Trnávka";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "805700";
    readonly Name: "Vajnory";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "804380";
    readonly Name: "Vinohrady";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "870293";
    readonly Name: "Vrakuňa";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "871796";
    readonly Name: "Záhorská Bystrica";
    readonly WsEnumCode: "ICL0079";
} | {
    readonly Code: "809985";
    readonly Name: "Čunovo";
    readonly WsEnumCode: "ICL0079";
} | null | undefined;
export declare const adresaStavbyBytu: (priznanie: {
    ulicaACisloDomu: string | undefined;
    supisneCislo: number | undefined;
    katastralneUzemie: string | undefined;
}) => {
    UlicaACislo: {
        Ulica: string | undefined;
        SupisneCislo: string | undefined;
        OrientacneCislo: string | undefined;
    };
    Obec: Ciselnik | null | undefined;
    Stat: Ciselnik | undefined;
};
export declare const tituly: (value: string | undefined) => {
    predMenom: Ciselnik | undefined;
    zaMenom: Ciselnik | undefined;
} | {
    predMenom: {
        Name: string;
    };
    zaMenom?: undefined;
} | null;
export {};
