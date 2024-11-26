import {
  conditionalFields,
  datePicker,
  fileUpload,
  input,
  radioGroup,
  schema,
  selectMultiple,
  step,
} from '../../generator/functions'
import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'

const ziadatelInvestorFields = [
  radioGroup(
    'typ',
    {
      type: 'string',
      title: 'Žiadate ako',
      required: true,
      items: createStringItems(['Fyzická osoba', 'Fyzická osoba – podnikateľ', 'Právnická osoba']),
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['typ'], { const: 'Fyzická osoba' }]]),
    [
      input('menoPriezvisko', { type: 'text', title: 'Meno a priezvisko', required: true }, {}),
      sharedAddressField('adresa', 'Korešpondenčná adresa', true),
    ],
    [input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {})],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'Fyzická osoba – podnikateľ' }]]), [
    sharedAddressField('miestoPodnikania', 'Miesto podnikania', true),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'Právnická osoba' }]]), [
    input('ico', { type: 'text', title: 'IČO', required: true }, {}),
    sharedAddressField('adresaSidla', 'Adresa sídla', true),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'Právnická osoba' }]]), [
    input('kontaktnaOsoba', { type: 'text', title: 'Kontaktná osoba', required: true }, {}),
  ]),
  input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
  sharedPhoneNumberField('telefon', true),
]

export const getSurSchema = (zavazne: boolean) =>
  schema(
    {
      title: zavazne
        ? 'Žiadosť o záväzné stanovisko k investičnej činnosti'
        : 'Žiadosť o stanovisko k investičnému zámeru',
    },
    {
      titlePath: 'stavba.nazov',
      titleFallback: 'Názov stavby/projektu',
    },
    [
      step('ziadatel', { title: 'Žiadateľ' }, ziadatelInvestorFields),
      step('investor', { title: 'Investor' }, [
        radioGroup(
          'investorZiadatelom',
          {
            type: 'boolean',
            title: 'Je investor rovnaká osoba ako žiadateľ?',
            required: true,
            items: [
              { value: true, label: 'Áno', isDefault: true },
              { value: false, label: 'Nie' },
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
        input('menoPriezvisko', { type: 'text', title: 'Meno a priezvisko', required: true }, {}),
        input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        sharedPhoneNumberField('projektantTelefon', true),
        input(
          'autorizacneOsvedcenie',
          { type: 'text', title: 'Číslo autorizačného osvedčenia', required: true },
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
        input('nazov', { type: 'text', title: 'Názov stavby/projektu', required: true }, {}),
        radioGroup(
          'druhStavby',
          {
            type: 'string',
            title: 'Druh stavby',
            items: createStringItems([
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
        input('ulica', { type: 'text', title: 'Ulica', required: true }, { size: 'medium' }),
        input('supisneCislo', { type: 'text', title: 'Súpisné číslo' }, { size: 'medium' }),
        input(
          'parcelneCislo',
          { type: 'text', title: 'Parcelné číslo', required: true },
          { size: 'medium' },
        ),
        selectMultiple(
          'kataster',
          {
            title: 'Katastrálne územie',
            required: true,
            items: createStringItems(
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
              'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza.',
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
                  items: createStringItems([
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
                      items: createStringItems([
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
    ],
  )
