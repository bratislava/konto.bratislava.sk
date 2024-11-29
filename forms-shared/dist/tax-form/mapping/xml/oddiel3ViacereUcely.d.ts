import { TaxFormData } from '../../types';
export declare const oddiel3ViacereUcelyXml: (data: TaxFormData) => {
    DanZoStaviebViacereUcely: {
        DanZoStaviebViacereUcelyZaznam: {
            AdresaStavby: {
                UlicaACislo: {
                    Ulica: string | undefined;
                    SupisneCislo: string | undefined;
                    OrientacneCislo: string | undefined;
                };
                Obec: import("../shared/esbsCiselniky").Ciselnik | null | undefined;
                Stat: import("../shared/esbsCiselniky").Ciselnik | undefined;
            };
            NazovKatastralnehoUzemia: {
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
            CisloParcely: string | undefined;
            PravnyVztah: import("../shared/esbsCiselniky").Ciselnik | null | undefined;
            Spoluvlastnictvo: import("../shared/esbsCiselniky").Ciselnik | null | undefined;
            RodneCisloManzelaAleboManzelky: string | undefined;
            PocetSpoluvlastnikov: string | undefined;
            SpoluvlastnikUrcenyDohodou: boolean | undefined;
            PopisStavby: string | undefined;
            DatumVznikuDanovejPovinnosti: string | undefined;
            DatumZanikuDanovejPovinnosti: string | undefined;
            ZakladDane: string | undefined;
            CelkovaVymeraPodlahovychPloch: string | undefined;
            VymeraPlochOslobodenychOdDane: string | undefined;
            VymeraPlochNaJednotliveUcely: {
                VymeraPlochNaJednotlivyUcel: {
                    Ucel: {
                        readonly Code: "0";
                        readonly Name: "Stavby na bývanie a drobné stavby, ktoré majú doplnkovú funkciu pre hlavnú stavbu";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "1";
                        readonly Name: "Stavby na pôdohospodársku produkciu, skleníky, stavby pre vodné hospodárstvo, stavby využívané na skladovanie vlastnej pôdohospodárskej produkcie vrátane stavieb na vlastnú administratívu";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "2";
                        readonly Name: "Chaty a stavby na individuálnu rekreáciu";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "3";
                        readonly Name: "Samostatne stojace garáže";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "4";
                        readonly Name: "Stavby hromadných garáží";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "5";
                        readonly Name: "Stavby hromadných garáží umiestnené pod zemou";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "6";
                        readonly Name: "Priemyselné stavby, stavby slúžiace energetike, stavby slúžiace stavebníctvu, stavby využívané na skladovanie vlastnej produkcie vrátane stavieb na vlastnú administratívu";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "7";
                        readonly Name: "Stavby na ostatné podnikanie a na zárobkovú činnosť, skladovanie a administratívu súvisiacu s ostatným podnikaním a so zárobkovou činnosťou";
                        readonly WsEnumCode: "ICL0041";
                    } | {
                        readonly Code: "8";
                        readonly Name: "Ostatné stavby";
                        readonly WsEnumCode: "ICL0041";
                    };
                    Vymera: string | undefined;
                }[];
            };
            PocetPodlazi: string | undefined;
            Poznamka: string;
            RodneCislo: string | undefined;
            ICO: string | undefined;
            PoradoveCislo: number;
        }[];
    };
} | null;
