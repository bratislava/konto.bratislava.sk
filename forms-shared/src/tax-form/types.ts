export type TaxFormData = {
  druhPriznania?: DruhPriznania
  udajeODanovnikovi?: UdajeODanovnikovi
  danZPozemkov?: DanZPozemkov
  danZoStaviebJedenUcel?: DanZoStaviebJedenUcel
  danZoStaviebViacereUcely?: DanZoStaviebViacereUcely
  danZBytovANebytovychPriestorov?: DanZBytovANebytovychPriestorov
  znizenieAleboOslobodenieOdDane?: ZnizenieAleboOslobodenieOdDane
  bezpodieloveSpoluvlastnictvoManzelov?: BezpodieloveSpoluvlastnictvoManzelov
}

export type DanZBytovANebytovychPriestorov = {
  vyplnitObject?: VyplnitObject
  kalkulackaWrapper?: KalkulackaWrapper
  priznania?: DanZBytovANebytovychPriestorovPriznanie[]
}

export type KalkulackaWrapper = {
  pouzitKalkulacku?: boolean
}

export type DanZBytovANebytovychPriestorovPriznanie = {
  cisloListuVlastnictva?: string
  riadok1?: Riadok1
  riadok2?: Riadok2
  pravnyVztah?: string
  spoluvlastnictvo?: string
  priznanieZaByt?: PriznanieZaByt
  priznanieZaNebytovyPriestor?: PriznanieZaNebytovyPriestor
  poznamka?: string
  pocetSpoluvlastnikov?: number
  naZakladeDohody?: boolean
  splnomocnenie?: string[]
}

export type PriznanieZaByt = {
  priznanieZaByt?: boolean
  cisloBytu?: string
  popisBytu?: string
  podielPriestoruNaSpolocnychCastiachAZariadeniachDomu?: string
  celkovaVymeraSpecialCase?: number
  spoluvlastnickyPodiel?: string
  vymeraPodlahovejPlochyBytu?: number
  vymeraPodlahovejPlochyNaIneUcely?: number
  datumy?: Datumy
}

export type PriznanieZaNebytovyPriestor = {
  priznanieZaNebytovyPriestor?: boolean
  nebytovePriestory?: NebytovePriestory[]
}

export type NebytovePriestory = {
  riadok?: Riadok
  podielPriestoruNaSpolocnychCastiachAZariadeniachDomu?: string
  celkovaVymeraSpecialCase?: number
  spoluvlastnickyPodiel?: string
  datumy?: Datumy
  vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome?: number
}

export type Datumy = {
  datumVznikuDanovejPovinnosti?: string
  datumZanikuDanovejPovinnosti?: string
}

export type Riadok = {
  ucelVyuzitiaNebytovehoPriestoruVBytovomDome?: string
  cisloNebytovehoPriestoruVBytovomDome?: string
}

export type Riadok1 = {
  ulicaACisloDomu?: string
  supisneCislo?: number
}

export type Kataster =
  | 'Čunovo'
  | 'Devín'
  | 'Devínska Nová Ves'
  | 'Dúbravka'
  | 'Jarovce'
  | 'Karlova Ves'
  | 'Lamač'
  | 'Nivy'
  | 'Nové Mesto'
  | 'Petržalka'
  | 'Podunajské Biskupice'
  | 'Rača'
  | 'Rusovce'
  | 'Ružinov'
  | 'Staré Mesto'
  | 'Trnávka'
  | 'Vajnory'
  | 'Vinohrady'
  | 'Vrakuňa'
  | 'Záhorská Bystrica'

export type Riadok2 = {
  kataster?: Kataster
  cisloParcely?: string
}

export type VyplnitObject = {
  vyplnit?: boolean
}

export type DanZPozemkov = {
  vyplnitObject?: VyplnitObject
  kalkulackaWrapper?: KalkulackaWrapper
  priznania?: DanZPozemkovPriznania[]
}

export type DanZPozemkovPriznania = {
  pravnyVztah?: string
  spoluvlastnictvo?: string
  pozemky?: Pozemky[]
  poznamka?: string
  pocetSpoluvlastnikov?: number
  naZakladeDohody?: boolean
  splnomocnenie?: string[]
}

export type Pozemky = {
  cisloListuVlastnictva?: string
  kataster?: Kataster
  parcelneCisloSposobVyuzitiaPozemku?: ParcelneCisloSposobVyuzitiaPozemku
  druhPozemku?: string
  celkovaVymeraPozemku?: number
  podielPriestoruNaSpolocnychCastiachAZariadeniachDomu?: string
  spoluvlastnickyPodiel?: string
  vymeraPozemku?: number
  datumy?: Datumy
  hodnotaUrcenaZnaleckymPosudkom?: boolean
  znaleckyPosudok?: string[]
}

export type ParcelneCisloSposobVyuzitiaPozemku = {
  cisloParcely?: string
  sposobVyuzitiaPozemku?: string
}

export type DanZoStaviebJedenUcel = {
  vyplnitObject?: VyplnitObject
  kalkulackaWrapper?: KalkulackaWrapper
  priznania?: DanZoStaviebJedenUcelPriznania[]
}

export type PredmetDane = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i'

export type DanZoStaviebJedenUcelPriznania = {
  cisloListuVlastnictva?: string
  riadok1?: Riadok1
  riadok2?: Riadok2
  pravnyVztah?: string
  spoluvlastnictvo?: string
  predmetDane?: PredmetDane
  celkovaZastavanaPlocha?: number
  spoluvlastnickyPodiel?: string
  pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia?: number
  castStavbyOslobodenaOdDane?: boolean
  datumy?: Datumy
  poznamka?: string
  castStavbyOslobodenaOdDaneDetaily?: CastStavbyOslobodenaOdDaneDetaily
  pocetSpoluvlastnikov?: number
  naZakladeDohody?: boolean
  splnomocnenie?: string[]
  zakladDane?: number
}

export type CastStavbyOslobodenaOdDaneDetaily = {
  celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby?: number
  vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb?: number
}

export type DanZoStaviebViacereUcely = {
  vyplnitObject?: VyplnitObject
  kalkulackaWrapper?: KalkulackaWrapper
  priznania?: DanZoStaviebViacereUcelyPriznania[]
}

export type DanZoStaviebViacereUcelyPriznania = {
  cisloListuVlastnictva?: string
  riadok1?: Riadok1
  riadok2?: Riadok2
  pravnyVztah?: string
  spoluvlastnictvo?: string
  popisStavby?: string
  datumy?: Datumy
  celkovaVymera?: number
  pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia?: number
  castStavbyOslobodenaOdDane?: boolean
  vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb?: number
  nehnutelnosti?: StavbyNehnutelnosti
  poznamka?: string
  pocetSpoluvlastnikov?: number
  naZakladeDohody?: boolean
  splnomocnenie?: string[]
  vymeraPodlahovychPloch?: number
  castStavbyOslobodenaOdDaneDetaily?: CastStavbyOslobodenaOdDaneDetaily
}

export type StavbyNehnutelnosti = {
  nehnutelnosti?: NehnutelnostiElement[]
  sumar?: {
    vymeraPodlahovychPloch?: number
    zakladDane?: number
  }
}

export type UcelVyuzitiaStavby = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i'

export type NehnutelnostiElement = {
  ucelVyuzitiaStavby?: string
  podielPriestoruNaSpolocnychCastiachAZariadeniachDomu?: string
  spoluvlastnickyPodiel?: string
  vymeraPodlahovejPlochy?: number
}
export type DruhPriznania = {
  druh?: DruhPriznaniaEnum
  rok?: number
}

export enum SplonomocnenecTyp {
  FyzickaOsoba = 'fyzickaOsoba',
  PravnickaOsoba = 'pravnickaOsoba',
}

export type OpravnenaOsoba = {
  splnomocnenie?: string[]
  splnomocnenecTyp?: SplonomocnenecTyp
  priezvisko?: string
  menoTitul?: MenoTitul
  obchodneMenoAleboNazov?: string
  ulicaCisloFyzickaOsoba?: UlicaCislo
  ulicaCisloPravnickaOsoba?: UlicaCislo
  obecPsc?: ObecPsc
  stat?: string
  email?: string
  telefon?: string
}

export enum PriznanieAko {
  FyzickaOsoba = 'fyzickaOsoba',
  FyzickaOsobaPodnikatel = 'fyzickaOsobaPodnikatel',
  PravnickaOsoba = 'pravnickaOsoba',
}

export enum PravnyVztahKPO {
  StatutarnyZastupca = 'statutarnyZastupca',
  Zastupca = 'zastupca',
  Spravca = 'spravca',
}

export type UdajeODanovnikovi = {
  voSvojomMene?: boolean
  opravnenaOsoba?: OpravnenaOsoba
  priznanieAko?: PriznanieAko
  pravnyVztahKPO?: PravnyVztahKPO
  rodneCislo?: string
  priezvisko?: string
  menoTitul?: MenoTitul
  ulicaCisloFyzickaOsoba?: UlicaCislo
  ulicaCisloFyzickaOsobaPodnikatel?: UlicaCislo
  ulicaCisloPravnickaOsoba?: UlicaCislo
  ico?: string
  pravnaForma?: string
  obchodneMenoAleboNazov?: string
  obecPsc?: ObecPsc
  korespondencnaAdresa?: KorespondencnaAdresa
  stat?: string
  email?: string
  telefon?: string
  udajeOOpravnenejOsobeNaPodaniePriznania?: UdajeOOpravnenejOsobeNaPodaniePriznania
}

export type KorespondencnaAdresa = {
  korespondencnaAdresaRovnaka?: boolean
  ulicaCisloKorespondencnaAdresa?: UlicaCislo
  obecPsc?: ObecPsc
  stat?: string
}

export type UdajeOOpravnenejOsobeNaPodaniePriznania = {
  pravnyVztahKPO?: PravnyVztahKPO
  priezvisko?: string
  menoTitul?: MenoTitul
  ulicaCisloFyzickaOsoba?: UlicaCislo
  obecPsc?: ObecPsc
  stat?: string
  email?: string
  telefon?: string
}

export type MenoTitul = {
  meno?: string
  titul?: string
}
export type ObecPsc = {
  obec?: string
  psc?: string
}
export type UlicaCislo = {
  ulica?: string
  cislo?: string
}

export type ZnizenieAleboOslobodenieOdDane = {
  pozemky?: ('option1' | 'option2' | 'option3' | 'option4')[]
  stavby?: ('option1' | 'option2' | 'option3')[]
  byty?: ('option1' | 'option2')[]
  poznamka?: string
}

export enum DruhPriznaniaEnum {
  Priznanie = 'priznanie',
  CiastkovePriznanie = 'ciastkovePriznanie',
  CiastkovePriznanieNaZanikDanovejPovinnosti = 'ciastkovePriznanieNaZanikDanovejPovinnosti',
  OpravnePriznanie = 'opravnePriznanie',
  DodatocnePriznanie = 'dodatocnePriznanie',
}

export enum PravnyVztah {
  Vlastnik = 'vlastnik',
  Spravca = 'spravca',
  Najomca = 'najomca',
  Uzivatel = 'uzivatel',
}

export enum Spoluvlastnictvo {
  Podielove = 'podieloveSpoluvlastnictvo',
  Bezpodielove = 'bezpodieloveSpoluvlastnictvoManzelov',
}

export interface BezpodieloveSpoluvlastnictvoManzelov {
  rodneCislo?: string
  priezvisko?: string
  menoTitul?: MenoTitul
  rovnakaAdresa?: boolean
  ulicaCisloBezpodieloveSpoluvlastnictvoManzelov?: UlicaCislo
  obecPsc?: ObecPsc
  stat?: string
  email?: string
  telefon?: string
}

export type TaxPdfMapping = Record<string, string | boolean | undefined>
