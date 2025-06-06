import { SharepointColumnMapValue } from '../../definitions/sharepointTypes'

const defaultColumnMapNajomneByvanie: Record<string, SharepointColumnMapValue> = {
  GinisID: {
    type: 'mag_number',
  },
  MenoZiadatela: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.meno',
  },
  PriezviskoZiadatela: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.priezvisko',
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.datumNarodenia',
  },
  Email: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.email',
  },
  TelefonneCislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.telefonneCislo',
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.ulicaACislo',
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.mesto',
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.psc',
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo',
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mesto',
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.psc',
  },
  PreferovanaVelkost: {
    type: 'json_path',
    info: 'ineOkolnosti.preferovanaVelkost',
  },
  MaPreferovanuLokalitu: {
    type: 'json_path',
    info: 'ineOkolnosti.maPreferovanuLokalitu',
  },
  PreferovanaLokalita: {
    type: 'json_path',
    info: 'ineOkolnosti.preferovanaLokalita',
  },
  MaximalnaVyskaNajomneho: {
    type: 'json_path',
    info: 'ineOkolnosti.maximalnaVyskaNajomneho',
  },
  KontaktovanyEmailom: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.kontaktovanyEmailom',
  },
  TzpPreukaz: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.tzpPreukaz',
  },
  MieraFunkcnejPoruchy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.mieraFunkcnejPoruchy',
  },
  MenoDrzitelaTzp: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.menoDrzitelaTzp',
  },
}

const columnMapNajomneByvanieZiadatel: Record<string, SharepointColumnMapValue> = {
  GinisID: {
    type: 'mag_number',
  },
  KontaktovanyEmailom: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.kontaktovanyEmailom',
  },
  Meno: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.meno',
  },
  Priezvisko: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.priezvisko',
  },
  RodnePriezvisko: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.rodnePriezvisko',
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.datumNarodenia',
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.statnaPrislusnost',
  },
  RodinnyStav: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.rodinnyStav',
  },
  Email: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.email',
  },
  TelefonneCislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.telefonneCislo',
  },
  TrvalyPobytUlicaACislo: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.ulicaACislo',
  },
  TrvalyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.mesto',
  },
  TrvalyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.psc',
  },
  TrvalyPobytVlastnikNehnutelnosti: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.vlastnikNehnutelnosti',
  },
  ByvanieVMestskomNajomnomByte: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.byvanieVMestskomNajomnomByte',
  },
  PobytVBratislaveViacAkoRok: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.pobytVBratislaveViacAkoRok',
  },
  SkutocnyPobytRovnakyAkoTrvaly: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytuRovnaka',
  },
  SkutocnyPobytUlica: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.ulicaACislo',
  },
  SkutocnyPobytMesto: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.mesto',
  },
  SkutocnyPobytPsc: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.osobneUdaje.adresaTrvalehoPobytu.adresaSkutocnehoPobytu.psc',
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
  ChronickeOchorenie: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.chronickeOchorenie',
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.existujuceDiagnozy',
  },
  BezbarierovyByt: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.zdravotnyStav.bezbarierovyByt',
  },
  BytovaNudza: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.bytovaNudza',
  },
  TypByvania: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.typByvania',
  },
  DlzkaBytovejNudze: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.sucasneByvanie.dlzkaBytovejNudze',
  },
  RizikoveFaktory: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktory.rizikoveFaktoryPritomne',
  },
  ZoznamRizikovychFaktorov: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktory.zoznamRizikovychFaktorov',
  },
  VekNajstarsiehoClena: {
    type: 'json_path',
    info: 'ziadatelZiadatelka.rizikoveFaktory.vekNajstarsiehoClena',
  },
  PreferovanaVelkost: {
    type: 'json_path',
    info: 'ineOkolnosti.preferovanaVelkost',
  },
  PreferovanaLokalita: {
    type: 'json_path',
    info: 'ineOkolnosti.preferovanaLokalita',
  },
  DovodyPodaniaZiadosti: {
    type: 'json_path',
    info: 'ineOkolnosti.dovodyPodaniaZiadosti',
  },
  MaximalnaVyskaNajomneho: {
    type: 'json_path',
    info: 'ineOkolnosti.maximalnaVyskaNajomneho',
  },
}

const defaultColumnMapNajomneByvanieDieta: Record<string, SharepointColumnMapValue> = {
  GinisID: {
    type: 'mag_number',
  },
  Meno: {
    type: 'json_path',
    info: 'osobneUdaje.meno',
  },
  Priezvisko: {
    type: 'json_path',
    info: 'osobneUdaje.priezvisko',
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'osobneUdaje.datumNarodenia',
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'osobneUdaje.statnaPrislusnost',
  },
  VlastnikNehnutelnosti: {
    type: 'json_path',
    info: 'osobneUdaje.vlastnikNehnutelnosti',
  },
  SucasneByvanieRovnakeAkoVase: {
    type: 'json_path',
    info: 'sucasneByvanie.situaciaRovnakaAkoVasa',
  },
  BytovaNudza: {
    type: 'json_path',
    info: 'sucasneByvanie.bytovaNudza',
  },
  TypByvania: {
    type: 'json_path',
    info: 'sucasneByvanie.typByvania',
  },
  DlzkaBytovejNudze: {
    type: 'json_path',
    info: 'sucasneByvanie.dlzkaBytovejNudze',
  },
  Student: {
    type: 'json_path',
    info: 'prijem.student',
  },
  MaPrijem: {
    type: 'json_path',
    info: 'prijem.maPrijem',
  },
  PrijemVyska: {
    type: 'json_path',
    info: 'prijem.prijemVyska',
  },
  ChronickeOchorenie: {
    type: 'json_path',
    info: 'zdravotnyStav.chronickeOchorenie',
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'zdravotnyStav.existujuceDiagnozy',
  },
}

const defaultColumnMapNajomneByvanieIniClenovia: Record<string, SharepointColumnMapValue> = {
  GinisID: {
    type: 'mag_number',
  },
  Meno: {
    type: 'json_path',
    info: 'osobneUdaje.meno',
  },
  Priezvisko: {
    type: 'json_path',
    info: 'osobneUdaje.priezvisko',
  },
  DatumNarodenia: {
    type: 'json_path',
    info: 'osobneUdaje.datumNarodenia',
  },
  StatnaPrislusnost: {
    type: 'json_path',
    info: 'osobneUdaje.statnaPrislusnost',
  },
  SucasneByvanieRovnakeAkoVase: {
    type: 'json_path',
    info: 'sucasneByvanie.situaciaRovnakaAkoVasa',
  },
  BytovaNudza: {
    type: 'json_path',
    info: 'sucasneByvanie.bytovaNudza',
  },
  TypByvania: {
    type: 'json_path',
    info: 'sucasneByvanie.typByvania',
  },
  DlzkaBytovejNudze: {
    type: 'json_path',
    info: 'sucasneByvanie.dlzkaBytovejNudze',
  },
  ZamestnaniePrijem: {
    type: 'json_path',
    info: 'prijem.zamestnaniePrijem',
  },
  SamostatnaZarobkovaCinnostPrijem: {
    type: 'json_path',
    info: 'prijem.samostatnaZarobkovaCinnostPrijem',
  },
  DochodokVyska: {
    type: 'json_path',
    info: 'prijem.dochodokVyska',
  },
  VyzivneVyska: {
    type: 'json_path',
    info: 'prijem.vyzivneVyska',
  },
  DavkaVNezamestnanostiVyska: {
    type: 'json_path',
    info: 'prijem.davkaVNezamestnanostiVyska',
  },
  InePrijmyVyska: {
    type: 'json_path',
    info: 'prijem.inePrijmyVyska',
  },
  ChronickeOchorenie: {
    type: 'json_path',
    info: 'zdravotnyStav.chronickeOchorenie',
  },
  ExistujuceDiagnozy: {
    type: 'json_path',
    info: 'zdravotnyStav.existujuceDiagnozy',
  },
  VlastnikNehnutelnosti: {
    type: 'json_path',
    info: 'osobneUdaje.vlastnikNehnutelnosti',
  },
}

const getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka = (
  prefix: 'druhDruzka' | 'manzelManzelka',
): Record<string, SharepointColumnMapValue> => {
  return {
    GinisID: {
      type: 'mag_number',
    },
    Meno: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.meno`,
    },
    Priezvisko: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.priezvisko`,
    },
    RodnePriezvisko: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.rodnePriezvisko`,
    },
    DatumNarodenia: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.datumNarodenia`,
    },
    StatnaPrislusnost: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.statnaPrislusnost`,
    },
    RodinnyStav: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.rodinnyStav`,
    },
    SkutocnyPobytUlica: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.adresaSkutocnehoPobytu.ulicaACislo`,
    },
    SkutocnyPobytMesto: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.adresaSkutocnehoPobytu.mesto`,
    },
    SkutocnyPobytPsc: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.adresaSkutocnehoPobytu.psc`,
    },
    VlastnikNehnutelnosti: {
      type: 'json_path',
      info: `${prefix}.osobneUdaje.adresaSkutocnehoPobytu.vlastnikNehnutelnosti`,
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
    ChronickeOchorenie: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.chronickeOchorenie`,
    },
    ExistujuceDiagnozy: {
      type: 'json_path',
      info: `${prefix}.zdravotnyStav.existujuceDiagnozy`,
    },
    SucasneByvanieRovnakeAkoVase: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.situaciaRovnakaAkoVasa`,
    },
    BytovaNudza: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.bytovaNudza`,
    },
    TypByvania: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.typByvania`,
    },
    DlzkaBytovejNudze: {
      type: 'json_path',
      info: `${prefix}.sucasneByvanie.dlzkaBytovejNudze`,
    },
  }
}

export const ziadostONajomBytuSharepointData = {
  databaseName: 'dtb_NajomneByvanieZiadost',
  columnMap: defaultColumnMapNajomneByvanie,
  oneToMany: {
    'deti.zoznamDeti': {
      databaseName: 'dtb_NajomneByvanieDieta',
      originalTableId: 'Deti',
      columnMap: defaultColumnMapNajomneByvanieDieta,
    },
    'inyClenoviaClenkyDomacnosti.zoznamInychClenov': {
      databaseName: 'dtb_NajomneByvanieIniClenovia',
      originalTableId: 'IniClenovia',
      columnMap: defaultColumnMapNajomneByvanieIniClenovia,
    },
  },
  oneToOne: {
    ziadatelZiadatelka: {
      databaseName: 'dtb_NajomneByvanieZiadatel',
      originalTableId: 'Ziadatel',
      columnMap: columnMapNajomneByvanieZiadatel,
    },
    'manzelManzelka.manzelManzelkaSucastouDomacnosti': {
      databaseName: 'dtb_NajomneByvanieManzel',
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
