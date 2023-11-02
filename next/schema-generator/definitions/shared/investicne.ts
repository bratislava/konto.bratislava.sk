import {
  conditionalFields,
  datePicker,
  fileUpload,
  input,
  object,
  radioGroup,
  schema,
  select,
  step,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'

const ziadatelInvestorFields = [
  radioGroup(
    'typ',
    {
      type: 'string',
      title: 'Žiadate ako',
      required: true,
      options: createStringOptions([
        'Fyzická osoba',
        'Fyzická osoba - podnikateľ',
        'Právnická osoba',
      ]),
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['typ'], { const: 'Fyzická osoba' }]]),
    [
      input('menoPriezvisko', { title: 'Meno a priezvisko', required: true }, { size: 'large' }),
      input('adresa', { title: 'Adresa trvalého pobytu', required: true }, { size: 'large' }),
    ],
    [input('obchodneMeno', { title: 'Obchodné meno', required: true }, { size: 'large' })],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'Fyzická osoba - podnikateľ' }]]), [
    input('miestoPodnikania', { title: 'Miesto podnikania', required: true }, { size: 'large' }),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'Právnická osoba' }]]), [
    input('ico', { title: 'IČO', required: true }, {}),
    input('adresaSidla', { title: 'Adresa sídla', required: true }, { size: 'large' }),
  ]),
  object(
    'mestoPsc',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      input('mesto', { title: 'Mesto', required: true }, { size: 'large' }),
      input('psc', { title: 'PSČ', required: true, format: 'zip' }, { size: 'large' }),
    ],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'Právnická osoba' }]]), [
    input('kontaktnaOsoba', { title: 'Kontaktná osoba', required: true }, { size: 'large' }),
  ]),
  input('email', { title: 'E-mail', required: true, type: 'email' }, { size: 'large' }),
  input('telefon', { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' }, {}),
]

export const getSchema = (zavazne: boolean) =>
  schema(
    zavazne
      ? {
          title: 'Záväzné stanovisko k investičnej činnosti',
          // eslint-disable-next-line no-secrets/no-secrets
          pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
          pospVersion: '0.1',
        }
      : {
          title: 'Stanovisko k investičnému zámeru',
          pospID: 'stanoviskoKInvesticnemuZameru',
          pospVersion: '0.1',
        },
    {
      moreInformationUrl: zavazne
        ? 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti'
        : 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/stanovisko-k-investicnemu-zameru',
      titlePath: 'stavba.stavbaNazov',
      titleFallback: 'Názov stavby/projektu',
    },
    [
      step('prilohy', { title: 'Prílohy' }, [
        fileUpload(
          zavazne ? 'projektovaDokumentacia' : 'architektonickaStudia',
          {
            title: zavazne ? 'Projektová dokumentácia' : 'Architektonická štúdia',
            required: true,
            multiple: true,
          },
          {
            type: 'dragAndDrop',
            helptext: zavazne
              ? 'Jednotlivé časti dokumentácie môžete nahrať samostatne alebo ako jeden súbor.'
              : 'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
            belowComponents: [
              {
                type: 'additionalLinks',
                props: {
                  links: [
                    zavazne
                      ? {
                          href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti',
                          title: 'Čo všetko má obsahovať projektová dokumentácia',
                        }
                      : {
                          href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/stanovisko-k-investicnemu-zameru',
                          title: 'Čo všetko má obsahovať architektonická štúdia',
                        },
                  ],
                },
              },
            ],
          },
        ),
      ]),
      step('ziadatel', { title: 'Žiadateľ' }, ziadatelInvestorFields),
      step('investor', { title: 'Investor' }, [
        radioGroup(
          'investorZiadatelom',
          {
            type: 'boolean',
            title: 'Je investor rovnaká osoba ako žiadateľ?',
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
        conditionalFields(createCondition([[['investorZiadatelom'], { const: false }]]), [
          fileUpload(
            'splnomocnenie',
            { title: 'Splnomocnenie na zastupovanie', required: true },
            {
              type: 'button',
              helptext: 'nahrajte splnomocnenie od investora',
            },
          ),
          ...ziadatelInvestorFields,
        ]),
      ]),
      step('zodpovednyProjektant', { title: 'Zodpovedný projektant' }, [
        input('menoPriezvisko', { title: 'Meno a priezvisko', required: true }, { size: 'large' }),
        input('email', { title: 'E-mail', required: true, type: 'email' }, { size: 'large' }),
        input(
          'projektantTelefon',
          { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
          {},
        ),
        input(
          'autorizacneOsvedcenie',
          { title: 'Číslo autorizačného osvedčenia', required: true },
          {
            helptext:
              'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním.',
          },
        ),
        datePicker(
          'datumSpracovania',
          { title: 'Dátum spracovania projektovej dokumentácie', required: true },
          {},
        ),
      ]),
      step('stavba', { title: 'Informácie o stavbe' }, [
        input('nazov', { title: 'Názov stavby/projektu', required: true }, { size: 'large' }),
        radioGroup(
          'druhStavby',
          {
            type: 'string',
            title: 'Druh stavby',
            options: createStringOptions([
              'Bytový dom',
              'Rodinný dom',
              'Iná budova na bývanie',
              'Nebytová budova',
              'Inžinierska stavba',
              'Iné',
            ]),
            required: true,
          },
          { variant: 'boxed' },
        ),
        input('ulica', { title: 'Ulica', required: true }, {}),
        input('supisneCislo', { title: 'Súpisné číslo' }, {}),
        input('parcelneCislo', { title: 'Parcelné číslo', required: true }, { size: 'large' }),
        select(
          'kataster',
          {
            title: 'Katastrálne územie',
            required: true,
            options: createStringOptions([
              'Čuňovo',
              'Devín',
              'Devínska Nová Ves',
              'Dúbravka',
              'Jarovce',
              'Karlova Ves',
              'Lamač',
              'Nivy',
              'Nové Mesto',
              'Petržalka',
              'Podunajské Biskupice',
              'Rača',
              'Rusovce',
              'Ružinov',
              'Staré mesto',
              'Trnávka',
              'Vajnory',
              'Vinohrady',
              'Vrakuňa',
              'Záhorská Bystrica',
            ]),
          },
          {
            helptext:
              'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza',
            dropdownDivider: true,
          },
        ),
      ]),
      ...(zavazne
        ? [
            step('konanieTyp', { title: 'Typ konania na stavebnom úrade' }, [
              radioGroup(
                'typ',
                {
                  type: 'string',
                  title: 'Typ konania',
                  options: createStringOptions([
                    'Územné konanie',
                    'Územné konanie spojené so stavebným konaním',
                    'Zmena stavby pred dokončením',
                    'Zmena v užívaní stavby',
                    'Konanie o dodatočnom povolení stavby',
                  ]),
                  required: true,
                },
                { variant: 'boxed' },
              ),
              conditionalFields(
                createCondition([[['typ'], { const: 'Konanie o dodatočnom povolení stavby' }]]),
                [
                  radioGroup(
                    'ziadostOdovodnenie',
                    {
                      type: 'string',
                      title: 'Upresnenie konania',
                      options: createStringOptions([
                        'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                        'Dodatočné povolenie zmeny stavby pred dokončením',
                      ]),
                      required: true,
                    },
                    { variant: 'boxed' },
                  ),
                ],
              ),
              conditionalFields(
                createCondition([
                  [
                    ['ziadostOdovodnenie'],
                    { const: 'Dodatočné povolenie zmeny stavby pred dokončením' },
                  ],
                ]),
                [
                  fileUpload(
                    'stavbaPisomnosti',
                    {
                      title: 'Relevantné písomnosti súvisiace so stavbou',
                      required: true,
                      multiple: true,
                    },
                    {
                      type: 'button',
                      helptext: 'napr. vydané stavebné povolenie, stanoviská hlavného mesta',
                    },
                  ),
                  fileUpload(
                    'stavbaFotodokumentacia',
                    { title: 'Fotodokumentácia stavby', required: true, multiple: true },
                    {
                      type: 'button',
                    },
                  ),
                ],
              ),
            ]),
          ]
        : []),
    ],
  )
