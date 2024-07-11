import { SharepointColumnMapValue } from "../definitions/sharepointTypes";

export const defaultColumnMapNajomneByvanie: Record<string, SharepointColumnMapValue> = {
  GinisID: {
    type: 'mag_number'
  },
  Meno: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.menoPriezvisko.meno'
  },
  Priezvisko: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.menoPriezvisko.priezvisko'
  },
  RodnePriezvisko: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rodnePriezvisko'
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.datumNarodenia'
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.statnaPrislusnost'
  },
  RodinnyStav: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rodinnyStav'
  },
  Email: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.email'
  },
  TelefonneCislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.telefonneCislo'
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.ulicaACislo'
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.mestoPsc.mesto'
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.mestoPsc.psc'
  },
  TrvalyPobytVlastnikNehnutelnosti: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.vlastnikNehnutelnosti'
  },
  TrvalyPobytPobytMenejAkoRok: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.pobytMenejAkoRok'
  },
  SkutocnyPobytRovnakyAkoTrvaly: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutcnehoPobytuRovnaka'
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo'
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.mesto'
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.psc'
  },
  ZamestnaniePrijem: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.zamestnaniePrijem'
  },
  SamostatnaZarobkovaCinnostPrijem: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.samostatnaZarobkovaCinnostPrijem'
  },
  DochodokVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.dochodokVyska'
  },
  VyzivneVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.vyzivneVyska'
  },
  DavkaVNezamestnanostiVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.davkaVNezamestnanostiVyska'
  },
  InePrijmyVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.inePrijmyVyska'
  },
  FunkcnaPorucha: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.funkcnaPorucha'
  },
  MieraFunkcnejPoruchy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.mieraFunkcnejPoruchy'
  },
  Diagnozy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.diagnozy'
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.existujuceDiagnozy'
  },
  StupenOdkazanosti: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.odkazanostWrapper.stupenOdkazanosti'
  },
  BezbarierovyByt: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyBytWrapper.bezbarierovyByt'
  },
  Invalidita: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyBytWrapper.invalidita'
  },
  MieraPoklesu: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyBytWrapper.mieraPoklesu'
  },
  BytovaNudza: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.bytovaNudza'
  },
  TypSkutocnehoByvania: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.typSkutocnehoByvania'
  },
  DlzkaBytovejNudze: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.dlzkaBytovejNudze'
  },
  NakladyNaByvanie: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.nakladyNaByvanie'
  },
  DovodNevyhovujucehoByvania: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.dovodNevyhovujucehoByvania'
  },
  RizikoveFaktory: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktoryWrapper.rizikoveFaktory'
  },
  ZoznamRizikovychFaktorov: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktoryWrapper.zoznamRizikovychFaktorov'
  },
  Vek: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktoryWrapper.vek'
  },
}

export const defaultColumnMapNajomneByvanieDieta: Record<string, SharepointColumnMapValue> = {
  Meno: {
    type: 'json_path',
    info: 'menoPriezvisko.meno'
  },
  Priezvisko: {
    type: 'json_path',
    info: 'menoPriezvisko.priezvisko'
  },
  RodnePriezvisko: {
    type: 'json_path',
    info: 'rodnePriezvisko'
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'datumNarodenia'
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'statnaPrislusnost'
  },
  RodinnyStav: {
    type: 'json_path',
    info: 'rodinnyStav'
  },
  TrvalyPobytRovnaky: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaTrvalehoPobytuRovnaka'
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.ulicaACislo'
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.mesto'
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.psc'
  },
  SkutocnyPobytRovnakyAkoTrvaly: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutcnehoPobytuRovnaka'
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo'
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.mesto'
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.psc'
  },
  PrijemVyska: {
    type: 'json_path',
    info: 'prijem.prijemVyska'
  },
  Student: {
    type: 'json_path',
    info: 'prijem.student'
  },
  FunkcnaPorucha: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.funkcnaPorucha'
  },
  MieraFunkcnejPoruchy: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.mieraFunkcnejPoruchy'
  },
  Diagnozy: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.diagnozy'
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.existujuceDiagnozy'
  },
  StupenOdkazanosti: {
    type: 'json_path',
    info: 'zdravotnyStav.odkazanostWrapper.stupenOdkazanosti'
  },
  Invalidita: {
    type: 'json_path',
    info: 'zdravotnyStav.bezbarierovyBytWrapper.invalidita'
  },
  MieraPoklesu: {
    type: 'json_path',
    info: 'zdravotnyStav.bezbarierovyBytWrapper.mieraPoklesu'
  },
  RizikoveFaktory: {
    type: 'json_path',
    info: 'rizikoveFaktoryWrapper.rizikoveFaktory'
  },
  ZoznamRizikovychFaktorov: {
    type: 'json_path',
    info: 'rizikoveFaktoryWrapper.zoznamRizikovychFaktorov'
  },
  SucasneByvanieRovnakeAkoVase: {
    type: 'json_path',
    info: 'sucasneByvanie.situaciaRovnakaAkoVasa'
  },
  SucasneByvanieDietata: {
    type: 'json_path',
    info: 'sucasneByvanie.sucasneByvanieDietata'
  },
}

export const defaultColumnMapNajomneByvanieDruhDruzka: Record<string, SharepointColumnMapValue> = {
  Meno: {
    type: 'json_path',
    info: 'druhDruzka.menoPriezvisko.meno'
  },
  Priezvisko: {
    type: 'json_path',
    info: 'druhDruzka.menoPriezvisko.priezvisko'
  },
  RodnePriezvisko: {
    type: 'json_path',
    info: 'druhDruzka.rodnePriezvisko'
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'druhDruzka.datumNarodenia'
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'druhDruzka.statnaPrislusnost'
  },
  RodinnyStav: {
    type: 'json_path',
    info: 'druhDruzka.rodinnyStav'
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.ulicaACislo'
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.mestoPsc.mesto'
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.mestoPsc.psc'
  },
  TrvalyPobytVlastnikNehnutelnosti: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.vlastnikNehnutelnosti'
  },
  SkutocnyPobytRovnakyAkoTrvaly: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.adresaSkutcnehoPobytuRovnaka'
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo'
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.mesto'
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'druhDruzka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.psc'
  },
  ZamestnaniePrijem: {
    type: 'json_path',
    info: 'druhDruzka.prijem.zamestnaniePrijem'
  },
  SamostatnaZarobkovaCinnostPrijem: {
    type: 'json_path',
    info: 'druhDruzka.prijem.samostatnaZarobkovaCinnostPrijem'
  },
  DochodokVyska: {
    type: 'json_path',
    info: 'druhDruzka.prijem.dochodokVyska'
  },
  VyzivneVyska: {
    type: 'json_path',
    info: 'druhDruzka.prijem.vyzivneVyska'
  },
  DavkaVNezamestnanostiVyska: {
    type: 'json_path',
    info: 'druhDruzka.prijem.davkaVNezamestnanostiVyska'
  },
  InePrijmyVyska: {
    type: 'json_path',
    info: 'druhDruzka.prijem.inePrijmyVyska'
  },
  FunkcnaPorucha: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.funkcnaPoruchaWrapper.funkcnaPorucha'
  },
  MieraFunkcnejPoruchy: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.funkcnaPoruchaWrapper.mieraFunkcnejPoruchy'
  },
  Diagnozy: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.funkcnaPoruchaWrapper.diagnozy'
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.funkcnaPoruchaWrapper.existujuceDiagnozy'
  },
  StupenOdkazanosti: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.odkazanostWrapper.stupenOdkazanosti'
  },
  BezbarierovyByt: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.bezbarierovyBytWrapper.bezbarierovyByt'
  },
  Invalidita: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.bezbarierovyBytWrapper.invalidita'
  },
  MieraPoklesu: {
    type: 'json_path',
    info: 'druhDruzka.zdravotnyStav.bezbarierovyBytWrapper.mieraPoklesu'
  },
  BytovaNudza: {
    type: 'json_path',
    info: 'druhDruzka.sucasneByvanie.bytovaNudza'
  },
  SucasneByvaniaRovnakaSituacia: {
    type: 'json_path',
    info: 'druhDruzka.sucasneByvanie.situaciaRovnakaAkoVasa'
  },
  TypSkutocnehoByvania: {
    type: 'json_path',
    info: 'druhDruzka.sucasneByvanie.typSkutocnehoByvania'
  },
  DlzkaBytovejNudze: {
    type: 'json_path',
    info: 'druhDruzka.sucasneByvanie.dlzkaBytovejNudze'
  },
  NakladyNaByvanie: {
    type: 'json_path',
    info: 'druhDruzka.sucasneByvanie.nakladyNaByvanie'
  },
  DovodNevyhovujucehoByvania: {
    type: 'json_path',
    info: 'druhDruzka.sucasneByvanie.dovodNevyhovujucehoByvania'
  },
  RizikoveFaktory: {
    type: 'json_path',
    info: 'druhDruzka.rizikoveFaktoryWrapper.rizikoveFaktory'
  },
  ZoznamRizikovychFaktorov: {
    type: 'json_path',
    info: 'druhDruzka.rizikoveFaktoryWrapper.zoznamRizikovychFaktorov'
  },
  Vek: {
    type: 'json_path',
    info: 'druhDruzka.rizikoveFaktoryWrapper.vek'
  },
}

export const defaultColumnMapNajomneByvanieManzelManzelka = replacePrefixInInfo(defaultColumnMapNajomneByvanieDruhDruzka, 'druhDruzka', 'manzelManzelka')

function replacePrefixInInfo(obj: Record<string, SharepointColumnMapValue>, prefix: string, newPrefix: string): Record<string, SharepointColumnMapValue> {
  const result: Record<string, SharepointColumnMapValue> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const record = obj[key]
      if (record.type === 'json_path') {
        result[key] = {
          type: record.type,
          info: record.info.replace(prefix, newPrefix)
        }
      } else {
        result[key] = record
      }
    }
  }

  return result;
}
