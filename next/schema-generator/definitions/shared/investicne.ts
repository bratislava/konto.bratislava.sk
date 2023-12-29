import {
  conditionalFields,
  datePicker,
  fileUpload,
  input,
  object,
  radioGroup,
  schema,
  selectMultiple,
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
        'Fyzická osoba – podnikateľ',
        'Právnická osoba',
      ]),
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['typ'], { const: 'Fyzická osoba' }]]),
    [
      input('menoPriezvisko', { title: 'Meno a priezvisko', required: true }, {}),
      input('adresa', { title: 'Adresa trvalého pobytu', required: true }, {}),
    ],
    [input('obchodneMeno', { title: 'Obchodné meno', required: true }, {})],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'Fyzická osoba – podnikateľ' }]]), [
    input('miestoPodnikania', { title: 'Miesto podnikania', required: true }, {}),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'Právnická osoba' }]]), [
    input('ico', { title: 'IČO', required: true }, {}),
    input('adresaSidla', { title: 'Adresa sídla', required: true }, {}),
  ]),
  object(
    'mestoPsc',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      input('mesto', { title: 'Mesto', required: true }, {}),
      input('psc', { title: 'PSČ', required: true, format: 'zip' }, {}),
    ],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'Právnická osoba' }]]), [
    input('kontaktnaOsoba', { title: 'Kontaktná osoba', required: true }, {}),
  ]),
  input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
  input(
    'telefon',
    { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
    { size: 'medium' },
  ),
]

export const getSchema = (zavazne: boolean) =>
  schema(
    zavazne
      ? {
          title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
          pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti',
          pospVersion: '0.7',
        }
      : {
          title: 'Žiadosť o stanovisko k investičnému zámeru',
          pospID: '00603481.stanoviskoKInvesticnemuZameru',
          pospVersion: '0.8',
        },
    {
      moreInformationUrl: zavazne
        ? 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti'
        : 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/stanovisko-k-investicnemu-zameru',
      titlePath: 'stavba.nazov',
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
        input('menoPriezvisko', { title: 'Meno a priezvisko', required: true }, {}),
        input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        input(
          'projektantTelefon',
          { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
          { size: 'medium' },
        ),
        input(
          'autorizacneOsvedcenie',
          { title: 'Číslo autorizačného osvedčenia', required: true },
          {
            helptext:
              'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním.',
            size: 'medium',
          },
        ),
        datePicker(
          'datumSpracovania',
          { title: 'Dátum spracovania projektovej dokumentácie', required: true },
          { size: 'medium' },
        ),
      ]),
      step('stavba', { title: 'Informácie o stavbe' }, [
        input('nazov', { title: 'Názov stavby/projektu', required: true }, {}),
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
        input('ulica', { title: 'Ulica', required: true }, { size: 'medium' }),
        input('supisneCislo', { title: 'Súpisné číslo' }, { size: 'medium' }),
        input('parcelneCislo', { title: 'Parcelné číslo', required: true }, { size: 'medium' }),
        selectMultiple(
          'kataster',
          {
            title: 'Katastrálne územie',
            required: true,
            options: createStringOptions(
              [
                'Čunovo',
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
                'Staré Mesto',
                'Trnávka',
                'Vajnory',
                'Vinohrady',
                'Vrakuňa',
                'Záhorská Bystrica',
              ],
              false,
            ),
          },
          {
            helptext:
              'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza',
            size: 'medium',
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
