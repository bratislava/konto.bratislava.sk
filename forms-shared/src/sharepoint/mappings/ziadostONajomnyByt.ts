import { SharepointColumnMapValue } from '../../definitions/sharepointTypes'

const defaultColumnMapNajomneByvanie: Record<string, SharepointColumnMapValue> = {
  GinisID: {
    type: 'mag_number',
  },
  Meno: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.menoPriezvisko.meno',
  },
  Priezvisko: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.menoPriezvisko.priezvisko',
  },
  RodnePriezvisko: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rodnePriezvisko',
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.datumNarodenia',
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.statnaPrislusnost',
  },
  RodinnyStav: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rodinnyStav',
  },
  Email: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.email',
  },
  TelefonneCislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.telefonneCislo',
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.ulicaACislo',
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.mestoPsc.mesto',
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.mestoPsc.psc',
  },
  TrvalyPobytVlastnikNehnutelnosti: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.vlastnikNehnutelnosti',
  },
  TrvalyPobytPobytMenejAkoRok: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.pobytMenejAkoRok',
  },
  SkutocnyPobytRovnakyAkoTrvaly: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutcnehoPobytuRovnaka',
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo',
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.mesto',
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.psc',
  },
  ZamestnaniePrijem: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.zamestnaniePrijem',
  },
  SamostatnaZarobkovaCinnostPrijem: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.samostatnaZarobkovaCinnostPrijem',
  },
  DochodokVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.dochodokVyska',
  },
  VyzivneVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.vyzivneVyska',
  },
  DavkaVNezamestnanostiVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.davkaVNezamestnanostiVyska',
  },
  InePrijmyVyska: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.prijem.inePrijmyVyska',
  },
  FunkcnaPorucha: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.funkcnaPorucha',
  },
  MieraFunkcnejPoruchy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.mieraFunkcnejPoruchy',
  },
  Diagnozy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.diagnozy',
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.funkcnaPoruchaWrapper.existujuceDiagnozy',
  },
  StupenOdkazanosti: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.odkazanostWrapper.stupenOdkazanosti',
  },
  BezbarierovyByt: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyBytWrapper.bezbarierovyByt',
  },
  Invalidita: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyBytWrapper.invalidita',
  },
  MieraPoklesu: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyBytWrapper.mieraPoklesu',
  },
  BytovaNudza: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.bytovaNudza',
  },
  TypSkutocnehoByvania: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.typSkutocnehoByvania',
  },
  DlzkaBytovejNudze: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.dlzkaBytovejNudze',
  },
  NakladyNaByvanie: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.nakladyNaByvanie',
  },
  DovodNevyhovujucehoByvania: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.dovodNevyhovujucehoByvania',
  },
  RizikoveFaktory: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktoryWrapper.rizikoveFaktory',
  },
  ZoznamRizikovychFaktorov: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktoryWrapper.zoznamRizikovychFaktorov',
  },
  Vek: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktoryWrapper.vek',
  },
}

const defaultColumnMapNajomneByvanieDieta: Record<string, SharepointColumnMapValue> = {
  Meno: {
    type: 'json_path',
    info: 'menoPriezvisko.meno',
  },
  Priezvisko: {
    type: 'json_path',
    info: 'menoPriezvisko.priezvisko',
  },
  RodnePriezvisko: {
    type: 'json_path',
    info: 'rodnePriezvisko',
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'datumNarodenia',
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'statnaPrislusnost',
  },
  RodinnyStav: {
    type: 'json_path',
    info: 'rodinnyStav',
  },
  TrvalyPobytRovnaky: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaTrvalehoPobytuRovnaka',
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.ulicaACislo',
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.mesto',
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.psc',
  },
  SkutocnyPobytRovnakyAkoTrvaly: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutcnehoPobytuRovnaka',
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo',
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.mesto',
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.psc',
  },
  PrijemVyska: {
    type: 'json_path',
    info: 'prijem.prijemVyska',
  },
  Student: {
    type: 'json_path',
    info: 'prijem.student',
  },
  FunkcnaPorucha: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.funkcnaPorucha',
  },
  MieraFunkcnejPoruchy: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.mieraFunkcnejPoruchy',
  },
  Diagnozy: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.diagnozy',
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'zdravotnyStav.funkcnaPoruchaWrapper.existujuceDiagnozy',
  },
  StupenOdkazanosti: {
    type: 'json_path',
    info: 'zdravotnyStav.odkazanostWrapper.stupenOdkazanosti',
  },
  Invalidita: {
    type: 'json_path',
    info: 'zdravotnyStav.bezbarierovyBytWrapper.invalidita',
  },
  MieraPoklesu: {
    type: 'json_path',
    info: 'zdravotnyStav.bezbarierovyBytWrapper.mieraPoklesu',
  },
  RizikoveFaktory: {
    type: 'json_path',
    info: 'rizikoveFaktoryWrapper.rizikoveFaktory',
  },
  ZoznamRizikovychFaktorov: {
    type: 'json_path',
    info: 'rizikoveFaktoryWrapper.zoznamRizikovychFaktorov',
  },
  SucasneByvanieRovnakeAkoVase: {
    type: 'json_path',
    info: 'sucasneByvanie.situaciaRovnakaAkoVasa',
  },
  SucasneByvanieDietata: {
    type: 'json_path',
    info: 'sucasneByvanie.sucasneByvanieDietata',
  },
}

const getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka = (
  prefix: 'druhDruzka' | 'manzelManzelka',
): Record<string, SharepointColumnMapValue> => {
  return {
    Meno: {
      type: 'json_path',
      info: `${prefix}.menoPriezvisko.meno`,
    },
    Priezvisko: {
      type: 'json_path',
      info: `${prefix}.menoPriezvisko.priezvisko`,
    },
    RodnePriezvisko: {
      type: 'json_path',
      info: `${prefix}.rodnePriezvisko`,
    },
    DatumNarodenia: {
      type: 'json_path',
      info: `${prefix}.datumNarodenia`,
    },
    StatnaPrislusnost: {
      type: 'json_path',
      info: `${prefix}.statnaPrislusnost`,
    },
    RodinnyStav: {
      type: 'json_path',
      info: `${prefix}.rodinnyStav`,
    },
    TrvalyPobytUlicaACislo: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.ulicaACislo`,
    },
    TrvalyPobytMesto: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.mestoPsc.mesto`,
    },
    TrvalyPobytPsc: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.mestoPsc.psc`,
    },
    TrvalyPobytVlastnikNehnutelnosti: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.vlastnikNehnutelnosti`,
    },
    SkutocnyPobytRovnakyAkoTrvaly: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.adresaSkutcnehoPobytuRovnaka`,
    },
    SkutocnyPobytUlica: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo`,
    },
    SkutocnyPobytMesto: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.mesto`,
    },
    SkutocnyPobytPsc: {
      type: 'json_path',
      info: `${prefix}.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mestoPsc.psc`,
    },
    ZamestnaniePrijem: {
      type: 'json_path',
      info: `${prefix}.prijem.zamestnaniePrijem`,
    },
    SamostatnaZarobkovaCinnostPrijem: {
      type: 'json_path',
      info: `${prefix}.prijem.samostatnaZarobkovaCinnostPrijem`,
    },
    DochodokVyska: {
      type: 'json_path',
      info: `${prefix}.prijem.dochodokVyska`,
    },
    VyzivneVyska: {
      type: 'json_path',
      info: `${prefix}.prijem.vyzivneVyska`,
    },
    DavkaVNezamestnanostiVyska: {
      type: 'json_path',
      info: `${prefix}.prijem.davkaVNezamestnanostiVyska`,
    },
    InePrijmyVyska: {
      type: 'json_path',
      info: `${prefix}.prijem.inePrijmyVyska`,
    },
    FunkcnaPorucha: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.funkcnaPoruchaWrapper.funkcnaPorucha`,
    },
    MieraFunkcnejPoruchy: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.funkcnaPoruchaWrapper.mieraFunkcnejPoruchy`,
    },
    Diagnozy: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.funkcnaPoruchaWrapper.diagnozy`,
    },
    ExistujuceDiagnozy: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.funkcnaPoruchaWrapper.existujuceDiagnozy`,
    },
    StupenOdkazanosti: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.odkazanostWrapper.stupenOdkazanosti`,
    },
    BezbarierovyByt: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.bezbarierovyBytWrapper.bezbarierovyByt`,
    },
    Invalidita: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.bezbarierovyBytWrapper.invalidita`,
    },
    MieraPoklesu: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.bezbarierovyBytWrapper.mieraPoklesu`,
    },
    BytovaNudza: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.bytovaNudza`,
    },
    SucasneByvaniaRovnakaSituacia: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.situaciaRovnakaAkoVasa`,
    },
    TypSkutocnehoByvania: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.typSkutocnehoByvania`,
    },
    DlzkaBytovejNudze: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.dlzkaBytovejNudze`,
    },
    NakladyNaByvanie: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.nakladyNaByvanie`,
    },
    DovodNevyhovujucehoByvania: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.dovodNevyhovujucehoByvania`,
    },
    RizikoveFaktory: {
      type: 'json_path',
      info: `${prefix}.rizikoveFaktoryWrapper.rizikoveFaktory`,
    },
    ZoznamRizikovychFaktorov: {
      type: 'json_path',
      info: `${prefix}.rizikoveFaktoryWrapper.zoznamRizikovychFaktorov`,
    },
    Vek: {
      type: 'json_path',
      info: `${prefix}.rizikoveFaktoryWrapper.vek`,
    },
  }
}

export const ziadostONajomnyBytSharepointData = {
  databaseName: 'dtb_NajomneByvanieTest',
  columnMap: defaultColumnMapNajomneByvanie,
  oneToMany: {
    'deti.zoznamDeti': {
      databaseName: 'dtb_NajomneByvanieDieta',
      originalTableId: 'Ziadatel',
      columnMap: defaultColumnMapNajomneByvanieDieta,
    },
  },
  oneToOne: {
    'manzelManzelka.manzelManzelkaSucastouDomacnosti': {
      databaseName: 'dtb_NajomneByvanieManzelTest',
      originalTableId: 'ManzelManzelka',
      columnMap: getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka('manzelManzelka'),
    },
    'druhDruzka.druhDruzkaSucastouDomacnosti': {
      databaseName: 'dtb_NajomneByvanieDruh',
      originalTableId: 'DruhDruzka',
      columnMap: getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka('druhDruzka'),
    },
  },
}
