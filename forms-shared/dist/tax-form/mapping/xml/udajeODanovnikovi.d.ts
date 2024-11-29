import { TaxFormData } from '../../types';
export declare const udajeODanovnikoviXml: (data: TaxFormData) => {
    DruhPriznania: import("../shared/esbsCiselniky").Ciselnik | null | undefined;
    NaRok: string | undefined;
    Danovnik: {
        TypOsoby: import("../shared/esbsCiselniky").Ciselnik | null | undefined;
        IdentifikaciaOsoby: {
            TitulyPredMenom: {
                TitulPredMenom: import("../shared/esbsCiselniky").Ciselnik | {
                    Name: string;
                };
            } | undefined;
            Meno: string | undefined;
            Priezvisko: string | undefined;
            TitulyZaMenom: {
                TitulZaMenom: import("../shared/esbsCiselniky").Ciselnik;
            } | undefined;
            DatumNarodenia: string | undefined;
            RodneCislo: string | undefined;
            ObchodneMenoNazov: string | undefined;
            ICO: string | undefined;
            PravnaForma: import("../shared/esbsCiselniky").Ciselnik | undefined;
        };
    };
    AdresaDanovnika: {
        Meno: string | undefined;
        Priezvisko: string | undefined;
        ObchodneMenoNazov: string | undefined;
        UlicaACislo: {
            Ulica: string | undefined;
            OrientacneCislo: string | undefined;
        };
        PSC: string | undefined;
        Obec: {
            Name: string | undefined;
        };
        Stat: import("../shared/esbsCiselniky").Ciselnik | undefined;
    };
    OpravnenaOsoba: {
        PravnyVztah: import("../shared/esbsCiselniky").Ciselnik | null | undefined;
        Meno: string | undefined;
        Priezvisko: string | undefined;
        TitulyPredMenom: {
            TitulPredMenom: import("../shared/esbsCiselniky").Ciselnik | {
                Name: string;
            };
        } | undefined;
        TitulyZaMenom: {
            TitulZaMenom: import("../shared/esbsCiselniky").Ciselnik;
        } | undefined;
        ObchodneMenoNazov: string | undefined;
        AdresaOpravnenejOsoby: {
            UlicaACislo: {
                Ulica: string | undefined;
                OrientacneCislo: string | undefined;
            };
            PSC: string | undefined;
            Obec: {
                Name: string | undefined;
            };
            Stat: import("../shared/esbsCiselniky").Ciselnik | undefined;
        };
        KontaktneUdajeOpravnenejOsoby: {
            TelefonneCislo: {
                MedzinarodneVolacieCislo: string;
                Predvolba: string;
                Cislo: string;
            } | undefined;
            Email: string | undefined;
        };
    };
    KontaktneUdajeDanovnika: {
        TelefonneCislo: {
            MedzinarodneVolacieCislo: string;
            Predvolba: string;
            Cislo: string;
        } | undefined;
        Email: string | undefined;
    };
};
