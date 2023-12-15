import { conditionalFields, input, object, radioGroup, select } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

enum DanovnikTyp {
  FyzickaOsoba,
  FyzickaOsobaPodnikatel,
  PravnickaOsoba,
  BezpodieloveSpoluvlastnictvoManzelov,
}

const adresa = (type: DanovnikTyp) => [
  object(
    'ulicaCislo',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      input(
        'ulica',
        { title: 'Ulica', required: true },
        {
          helptext: {
            [DanovnikTyp.FyzickaOsoba]: 'Zadajte ulicu svojho trvalého pobytu.',
            [DanovnikTyp.FyzickaOsobaPodnikatel]:
              'Zadajte ulicu miesta podnikania podľa živnostenského registra.',
            [DanovnikTyp.PravnickaOsoba]: 'Zadajte ulicu sídla.',
            [DanovnikTyp.BezpodieloveSpoluvlastnictvoManzelov]:
              'Zadajte ulicu trvalého pobytu manžela/manželky.',
          }[type],
        },
      ),
      input('cislo', { title: 'Čislo', required: true }, {}),
    ],
  ),
  object(
    'obecPsc',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      input('obec', { title: 'Obec', required: true }, {}),
      input('psc', { title: 'PSČ', required: true, format: 'zip' }, {}),
    ],
  ),
  // TODO Select ciselnik
  input('stat', { title: 'Štát', required: true }, {}),
]

const danovnikBase = (type: DanovnikTyp) => [
  ...(type === DanovnikTyp.BezpodieloveSpoluvlastnictvoManzelov
    ? [
        radioGroup(
          'rovnakaAdresa',
          {
            type: 'boolean',
            title: 'Má trvalé bydlisko na rovnakej adrese ako vy?',
            required: true,
            options: [
              { value: true, title: 'Áno', isDefault: true },
              { value: false, title: 'Nie' },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
          },
        ),
        conditionalFields(createCondition([[['rovnakaAdresa'], { const: false }]]), adresa(type)),
      ]
    : adresa(type)),
  input(
    'email',
    { title: 'E-mail', type: 'email', required: true },
    { helptext: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' },
  ),
  input(
    'telefon',
    { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
    { helptext: 'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.', size: 'medium' },
  ),
]

export const fyzickaOsoba = (
  splnomocnenie: boolean,
  bezpodieloveSpoluvlastnictvoManzelov?: boolean,
) => [
  ...(splnomocnenie
    ? []
    : [
        input(
          'rodneCislo',
          { title: 'Rodné číslo', required: true },
          {
            helptext:
              'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia.',
          },
        ),
      ]),
  input('priezvisko', { title: 'Priezvisko', required: true }, {}),
  object(
    'menoTitul',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [input('meno', { title: 'Meno', required: true }, {}), input('titul', { title: 'Titul' }, {})],
  ),
  ...danovnikBase(
    bezpodieloveSpoluvlastnictvoManzelov
      ? DanovnikTyp.BezpodieloveSpoluvlastnictvoManzelov
      : DanovnikTyp.FyzickaOsoba,
  ),
]
export const fyzickaOsobaPodnikatel = [
  input('ico', { title: 'IČO', required: true }, {}),
  input('obchodneMenoAleboNazov', { title: 'Obchodné meno alebo názov', required: true }, {}),
  ...danovnikBase(DanovnikTyp.FyzickaOsobaPodnikatel),
]
export const pravnickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        input('ico', { title: 'IČO', required: true }, {}),
        select(
          'pravnaForma',
          {
            title: 'Právna forma',
            required: true,
            options: [
              {
                value: '111',
                title: '111 Verejná obchodná spoločnosť',
              },
              {
                value: '112',
                title: '112 Spoločnosť s ručením obmedzeným',
              },
              {
                value: '113',
                title: '113 Komanditná spoločnosť',
              },
              {
                value: '117',
                title: '117 Nadácia',
              },
              {
                value: '118',
                title: '118 Neinvestičný fond',
              },
              {
                value: '119',
                title: '119 Nezisková organizácia',
              },
              {
                value: '121',
                title: '121 Akciová spoločnosť',
              },
              {
                value: '205',
                title: '205 Družstvo',
              },
              {
                value: '271',
                title: '271 Spoločenstvá vlastníkov pozemkov, bytov a pod.',
              },
              {
                value: '301',
                title: '301 Štátny podnik',
              },
              {
                value: '311',
                title: '311 Národná banka Slovenska',
              },
              {
                value: '312',
                title: '312 Banka – štátny peňažný ústav',
              },
              {
                value: '321',
                title: '321 Rozpočtová organizácia',
              },
              {
                value: '331',
                title: '331 Príspevková organizácia',
              },
              {
                value: '381',
                title: '381 Fondy',
              },
              {
                value: '382',
                title: '382 Verejnoprávna inštitúcia',
              },
              {
                value: '421',
                title: '421 Zahraničná osoba',
              },
              {
                value: '433',
                title: '433 Sociálna a zdravotné poisťovne',
              },
              {
                value: '434',
                title: '434 Doplnková dôchodková poisťovňa',
              },
              {
                value: '445',
                title: '445 Komoditná burza',
              },
              {
                value: '701',
                title: '701 Združenie (zväz, spolok, spoločnosť, klub a iné)',
              },
              {
                value: '711',
                title: '711 Politická strana, politické hnutie',
              },
              {
                value: '721',
                title: '721 Cirkevná organizácia',
              },
              {
                value: '741',
                title: '741 Stavovská organizácia – profesná komora',
              },
              {
                value: '745',
                title: '745 Komora (s vynimkou profesných komôr)',
              },
              {
                value: '751',
                title: '751 Záujmové združenie právnických osôb',
              },
              {
                value: '801',
                title: '801 Obec (obecný úrad)',
              },
              {
                value: '802',
                title: '802 Krajský a obvodný úrad',
              },
              {
                value: '921',
                title: '921 Medzinárodné organizácie a združenia',
              },
              {
                value: '931',
                title: '931 Zastúpenie zahraničnej právnickej osoby',
              },
            ],
          },
          {},
        ),
      ]),
  input('obchodneMenoAleboNazov', { title: 'Obchodné meno alebo názov', required: true }, {}),
  ...danovnikBase(DanovnikTyp.PravnickaOsoba),
]
