import {
  conditionalFields,
  datePicker,
  inputField,
  object,
  radioButton,
  schema,
  selectMultipleField,
  step,
  upload,
} from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

const ziadatelInvestorFields = [
  radioButton(
    'typ',
    {
      title: 'Žiadate ako',
      required: true,
      options: [
        { value: 'fyzickaOsoba', title: 'Fyzická osoba', isDefault: true },
        { value: 'fyzickaOsobaPodnikatel', title: 'Fyzická osoba - podnikateľ' },
        { value: 'pravnickaOsoba', title: 'Právnicka osoba' },
      ],
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['typ'], { const: 'fyzickaOsoba' }]]),
    [
      inputField(
        'menoPriezvisko',
        { title: 'Meno a priezvisko', required: true },
        { size: 'large' },
      ),
      inputField('adresa', { title: 'Adresa trvalého pobytu', required: true }, { size: 'large' }),
    ],
    [inputField('obchodneMeno', { title: 'Obchodné meno', required: true }, { size: 'large' })],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'fyzickaOsobaPodnikatel' }]]), [
    inputField(
      'miestoPodnikania',
      { title: 'Miesto podnikania', required: true },
      { size: 'large' },
    ),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'pravnickaOsoba' }]]), [
    inputField('ico', { title: 'IČO', required: true }, {}),
    inputField('adresaSidla', { title: 'Adresa sídla', required: true }, { size: 'large' }),
  ]),
  object(
    'mestoPsc',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField('mesto', { title: 'Mesto', required: true }, { size: 'large' }),
      inputField('psc', { title: 'PSČ', required: true }, {}),
    ],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'pravnickaOsoba' }]]), [
    inputField('kontaktnaOsoba', { title: 'Kontaktná osoba', required: true }, { size: 'large' }),
  ]),
  inputField('email', { title: 'E-mail', required: true }, { size: 'large' }),
  inputField('telefon', { title: 'Telefónne číslo (v tvare +421...)', required: true }, {}),
]

export const getSchema = (zavazne: boolean) =>
  schema(
    zavazne
      ? {
          title: 'Záväzné stanovisko k investičnej činnosti',
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
        zavazne
          ? upload(
              'projektovaDokumentacia',
              { title: 'Projektová dokumentácia', required: true, multiple: true },
              {
                type: 'dragAndDrop',
                helptext: 'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
                additionalLinks: [
                  {
                    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti',
                    title: 'Čo všetko má obsahovať projektová dokumentácia',
                  },
                ],
              },
            )
          : upload(
              'architektonickaStudia',
              { title: 'Architektonická štúdia', required: true, multiple: true },
              {
                type: 'dragAndDrop',
                helptext: 'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
                additionalLinks: [
                  {
                    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/stanovisko-k-investicnemu-zameru',
                    title: 'Čo všetko má obsahovať architektonická štúdia',
                  },
                ],
              },
            ),
      ]),
      step('ziadatel', { title: 'Žiadateľ' }, ziadatelInvestorFields),
      step('investor', { title: 'Investor' }, [
        radioButton(
          'investorZiadatelom',
          {
            title: 'Je investor rovnaká osoba ako žiadateľ?',
            required: true,
            options: [
              { value: 'true', title: 'Áno', isDefault: true },
              { value: 'false', title: 'Nie' },
            ],
          },
          { variant: 'boxed' },
        ),
        conditionalFields(createCondition([[['investorZiadatelom'], { const: 'false' }]]), [
          upload(
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
        inputField(
          'menoPriezvisko',
          { title: 'Meno a priezvisko', required: true },
          { size: 'large' },
        ),
        inputField('email', { title: 'E-mail', required: true }, { size: 'large' }),
        inputField(
          'projektantTelefon',
          { title: 'Telefónne číslo (v tvare +421...)', required: true },
          {},
        ),
        inputField(
          'autorizacneOsvedcenie',
          { title: 'Číslo autorizačného osvedčenia', required: true },
          {
            description:
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
        inputField('nazov', { title: 'Názov stavby/projektu', required: true }, { size: 'large' }),
        radioButton(
          'druhStavby',
          {
            title: 'Druh stavby',
            options: [
              { value: 'bytovyDom', title: 'Bytový dom', isDefault: true },
              { value: 'rodinnyDom', title: 'Rodinný dom' },
              { value: 'inaBudovaNaByvanie', title: 'Iná budova na bývanie' },
              { value: 'nebytovaBudova', title: 'Nebytová budova' },
              { value: 'inzinierskaStavba', title: 'Inžinierska stavba' },
              { value: 'ine', title: 'Iné' },
            ],
            required: true,
          },
          { variant: 'boxed' },
        ),
        inputField('ulica', { title: 'Ulica', required: true }, {}),
        inputField('supisneCislo', { title: 'Súpisné číslo' }, {}),
        inputField('parcelneCislo', { title: 'Parcelné číslo', required: true }, { size: 'large' }),
        selectMultipleField(
          'kataster',
          {
            title: 'Katastrálne územie',
            required: true,
            options: [
              {
                value: 'Čuňovo',
                title: 'Čuňovo',
              },
              {
                value: 'Devín',
                title: 'Devín',
              },
              {
                value: 'Devínska Nová Ves',
                title: 'Devínska Nová Ves',
              },
              {
                value: 'Dúbravka',
                title: 'Dúbravka',
              },
              {
                value: 'Jarovce',
                title: 'Jarovce',
              },
              {
                value: 'Karlova Ves',
                title: 'Karlova Ves',
              },
              {
                value: 'Lamač',
                title: 'Lamač',
              },
              {
                value: 'Nivy',
                title: 'Nivy',
              },
              {
                value: 'Nové Mesto',
                title: 'Nové Mesto',
              },
              {
                value: 'Petržalka',
                title: 'Petržalka',
              },
              {
                value: 'Podunajské Biskupice',
                title: 'Podunajské Biskupice',
              },
              {
                value: 'Rača',
                title: 'Rača',
              },
              {
                value: 'Rusovce',
                title: 'Rusovce',
              },
              {
                value: 'Ružinov',
                title: 'Ružinov',
              },
              {
                value: 'Staré mesto',
                title: 'Staré mesto',
              },
              {
                value: 'Trnávka',
                title: 'Trnávka',
              },
              {
                value: 'Vajnory',
                title: 'Vajnory',
              },
              {
                value: 'Vinohrady',
                title: 'Vinohrady',
              },
              {
                value: 'Vrakuňa',
                title: 'Vrakuňa',
              },
              {
                value: 'Záhorská Bystrica',
                title: 'Záhorská Bystrica',
              },
            ],
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
              radioButton(
                'typ',
                {
                  title: 'Typ konania',
                  options: [
                    { value: 'uzemneKonanie', title: 'Územné konanie', isDefault: true },
                    {
                      value: 'uzemneKonanieSpojeneSoStavebnymKonanim',
                      title: 'Územné konanie spojené so stavebným konaním',
                    },
                    { value: 'zmenaStavbyPredDokoncenim', title: 'Zmena stavby pred dokončením' },
                    { value: 'zmenaVUzivaniStavby', title: 'Zmena v užívaní stavby' },
                    {
                      value: 'konanieODodatocnomPovoleniStavby',
                      title: 'Konanie o dodatočnom povolení stavby',
                    },
                  ],
                  required: true,
                },
                { variant: 'boxed' },
              ),
              conditionalFields(
                createCondition([[['typ'], { const: 'konanieODodatocnomPovoleniStavby' }]]),
                [
                  radioButton(
                    'ziadostOdovodnenie',
                    {
                      title: 'Typ konania',
                      options: [
                        {
                          value: 'realizaciaStavby',
                          title: 'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                          isDefault: true,
                        },
                        {
                          value: 'dodatocnePovolenieZmeny',
                          title: 'Dodatočné povolenie zmeny stavby pred dokončením',
                        },
                      ],
                      required: true,
                    },
                    { variant: 'boxed' },
                  ),
                ],
              ),
              conditionalFields(
                createCondition([[['ziadostOdovodnenie'], { const: 'dodatocnePovolenieZmeny' }]]),
                [
                  upload(
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
                  upload(
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
