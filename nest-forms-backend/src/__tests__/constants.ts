/* eslint-disable pii/no-email */
/* eslint-disable no-secrets/no-secrets */
/* eslint-disable unicorn/no-thenable */

import { JsonSchema } from '../utils/types/global'

export const jsonSchema = {
  pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
  pospVersion: '0.1',
  title: 'Záväzné stanovisko k investičnej činnosti',
  type: 'object',
  required: [
    'ziadatel',
    'investor',
    'projektant',
    'stavba',
    'konanie',
    'prilohy',
  ],
  allOf: [
    {
      properties: {
        prilohy: {
          type: 'object',
          title: 'Prílohy',
          properties: {
            projektovaDokumentacia: {
              type: 'array',
              title: 'Projektová dokumentácia',
              items: {
                type: 'string',
                format: 'file',
              },
            },
          },
          required: ['projektovaDokumentacia'],
        },
      },
    },
    {
      properties: {
        ziadatel: {
          type: 'object',
          title: 'Žiadateľ',
          properties: {
            ziatetelTyp: {
              title: 'Žiadate ako',
              type: 'string',
              default: 'Fyzická osoba',
              enum: [
                'Fyzická osoba',
                'Fyzická osoba - podnikateľ',
                'Právnicka osoba',
              ],
            },
          },
          required: ['ziatetelTyp'],
          allOf: [
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    const: 'Fyzická osoba',
                  },
                },
              },
              then: {
                properties: {
                  ziadatelMenoPriezvisko: {
                    type: 'string',
                    pattern: '.*[ ].*',
                    title: 'Meno a priezvisko',
                  },
                },
                required: ['ziadatelMenoPriezvisko'],
              },
            },
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    oneOf: [
                      {
                        const: 'Fyzická osoba - podnikateľ',
                      },
                      {
                        const: 'Právnicka osoba',
                      },
                    ],
                  },
                },
              },
              then: {
                properties: {
                  ziadatelObchodneMeno: {
                    type: 'string',
                    title: 'Obchodné meno',
                  },
                },
                required: ['ziadatelObchodneMeno'],
              },
            },
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    const: 'Právnicka osoba',
                  },
                },
              },
              then: {
                properties: {
                  ziadatelIco: {
                    type: 'number',
                    title: 'IČO',
                  },
                },
                required: ['ziadatelIco'],
              },
            },
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    const: 'Fyzická osoba',
                  },
                },
              },
              then: {
                properties: {
                  ziadatelAdresaPobytu: {
                    type: 'string',
                    title: 'Adresa trvalého pobytu',
                  },
                },
                required: ['ziadatelAdresaPobytu'],
              },
            },
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    const: 'Fyzická osoba - podnikateľ',
                  },
                },
              },
              then: {
                properties: {
                  ziadatelMiestoPodnikania: {
                    type: 'string',
                    title: 'Miesto podnikania',
                  },
                },
                required: ['ziadatelMiestoPodnikania'],
              },
            },
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    const: 'Právnicka osoba',
                  },
                },
              },
              then: {
                properties: {
                  ziadatelAdresaSidla: {
                    type: 'string',
                    title: 'Adresa sídla',
                  },
                },
                required: ['ziadatelAdresaSidla'],
              },
            },
            {
              properties: {
                ziadatelMestoPsc: {
                  type: 'object',
                  properties: {
                    ziadatelMesto: {
                      type: 'string',
                      title: 'Mesto',
                      format: 'ciselnik',
                    },
                    ziadatelPsc: {
                      type: 'string',
                      title: 'PSČ',
                    },
                  },
                  required: ['ziadatelMesto', 'ziadatelPsc'],
                },
              },
            },
            {
              if: {
                properties: {
                  ziatetelTyp: {
                    const: 'Právnicka osoba',
                  },
                },
              },
              then: {
                properties: {
                  ziadatelKontaktnaOsoba: {
                    type: 'string',
                    title: 'Kontaktná osoba',
                  },
                },
                required: ['ziadatelKontaktnaOsoba'],
              },
            },
            {
              properties: {
                ziadatelEmail: {
                  type: 'string',
                  title: 'E-mail',
                  format: 'email',
                },
                ziadatelTelefon: {
                  type: 'string',
                  title: 'Telefónne číslo (v tvare +421...)',
                  pattern:
                    '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                },
              },
              required: ['ziadatelEmail', 'ziadatelTelefon'],
            },
          ],
        },
      },
    },
    {
      properties: {
        investor: {
          type: 'object',
          title: 'Investor',
          properties: {
            investorZiadatelom: {
              title: 'Je investor rovnaká osoba ako žiadateľ?',
              type: 'boolean',
              default: true,
            },
          },
          required: ['investorZiadatelom'],
          allOf: [
            {
              if: {
                properties: {
                  investorZiadatelom: {
                    const: false,
                  },
                },
              },
              then: {
                properties: {
                  splnomocnenie: {
                    type: 'array',
                    title: 'Splnomocnenie na zastupovanie',
                    items: {
                      type: 'string',
                      format: 'file',
                    },
                  },
                },
                required: ['splnomocnenie'],
              },
            },
            {
              if: {
                properties: {
                  investorZiadatelom: {
                    const: false,
                  },
                },
              },
              then: {
                allOf: [
                  {
                    properties: {
                      splnomocnenie: {
                        type: 'array',
                        title: 'Splnomocnenie na zastupovanie',
                        items: {
                          type: 'string',
                          format: 'file',
                        },
                      },
                      investorTyp: {
                        title: 'Typ investora',
                        type: 'string',
                        default: 'Fyzická osoba',
                        enum: [
                          'Fyzická osoba',
                          'Fyzická osoba - podnikateľ',
                          'Právnicka osoba',
                        ],
                      },
                    },
                    required: ['splnomocnenie', 'investorTyp'],
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          const: 'Fyzická osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorMenoPriezvisko: {
                          type: 'string',
                          pattern: '.*[ ].*',
                          title: 'Meno a priezvisko',
                        },
                      },
                      required: ['investorMenoPriezvisko'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          oneOf: [
                            {
                              const: 'Fyzická osoba - podnikateľ',
                            },
                            {
                              const: 'Právnicka osoba',
                            },
                          ],
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorObchodneMeno: {
                          type: 'string',
                          title: 'Obchodné meno',
                        },
                      },
                      required: ['investorObchodneMeno'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorIco: {
                          type: 'number',
                          title: 'IČO',
                        },
                      },
                      required: ['investorIco'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          const: 'Fyzická osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorAdresaPobytu: {
                          type: 'string',
                          title: 'Adresa trvalého pobytu',
                        },
                      },
                      required: ['investorAdresaPobytu'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          const: 'Fyzická osoba - podnikateľ',
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorMiestoPodnikania: {
                          type: 'string',
                          title: 'Miesto podnikania',
                        },
                      },
                      required: ['investorMiestoPodnikania'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorAdresaSidla: {
                          type: 'string',
                          title: 'Adresa sídla',
                        },
                      },
                      required: ['investorAdresaSidla'],
                    },
                  },
                  {
                    properties: {
                      investorMestoPsc: {
                        type: 'object',
                        properties: {
                          investorMesto: {
                            type: 'string',
                            title: 'Mesto',
                            format: 'ciselnik',
                          },
                          investorPsc: {
                            type: 'string',
                            title: 'PSČ',
                          },
                        },
                        required: ['investorMesto', 'investorPsc'],
                      },
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        investorKontaktnaOsoba: {
                          type: 'string',
                          title: 'Kontaktná osoba',
                        },
                      },
                      required: ['investorKontaktnaOsoba'],
                    },
                  },
                  {
                    properties: {
                      investorEmail: {
                        type: 'string',
                        title: 'E-mail',
                        format: 'email',
                      },
                      investorTelefon: {
                        type: 'string',
                        title: 'Telefónne číslo (v tvare +421...)',
                        pattern:
                          '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                      },
                    },
                    required: ['investorEmail', 'investorTelefon'],
                  },
                ],
              },
            },
          ],
        },
      },
    },
    {
      properties: {
        projektant: {
          type: 'object',
          title: 'Zodpovedný projektant',
          properties: {
            projektantMenoPriezvisko: {
              type: 'string',
              pattern: '.*[ ].*',
              title: 'Meno a priezvisko',
            },
            projektantEmail: {
              type: 'string',
              title: 'E-mail',
              format: 'email',
            },
            projektantTelefon: {
              type: 'string',
              title: 'Telefónne číslo (v tvare +421...)',
              pattern:
                '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
            },
            autorizacneOsvedcenie: {
              type: 'string',
              title: 'Číslo autorizačného osvedčenia',
              description:
                'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním. ',
            },
            datumSpracovania: {
              type: 'string',
              title: 'Dátum spracovania projektovej dokumentácie',
              format: 'date',
            },
          },
          required: [
            'projektantMenoPriezvisko',
            'projektantEmail',
            'projektantTelefon',
            'autorizacneOsvedcenie',
            'datumSpracovania',
          ],
        },
      },
    },
    {
      properties: {
        stavba: {
          type: 'object',
          title: 'Informácie o stavbe',
          properties: {
            stavbaNazov: {
              type: 'string',
              title: 'Názov stavby/projektu',
            },
            stavbaDruh: {
              type: 'string',
              title: 'Druh stavby',
              default: 'Bytový dom',
              enum: [
                'Bytový dom',
                'Rodinný dom',
                'Iná budova na bývanie',
                'Nebytová budova',
                'Inžinierska stavba',
                'Iné',
              ],
            },
            stavbaUlica: {
              type: 'string',
              title: 'Ulica',
            },
            stavbaSupisneCislo: {
              type: 'number',
              title: 'Súpisné číslo',
            },
            stavbaParcela: {
              title: 'Parcelné číslo',
              description:
                'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na katastrálnej mape ZBGIS.',
              type: 'string',
            },
            stavbaKataster: {
              title: 'Katastrálne územie',
              type: 'array',
              uniqueItems: true,
              items: {
                type: 'string',
                oneOf: [
                  {
                    const: 'Čuňovo',
                    title: 'Čuňovo',
                  },
                  {
                    const: 'Devín',
                    title: 'Devín',
                  },
                  {
                    const: 'Devínska Nová Ves',
                    title: 'Devínska Nová Ves',
                  },
                  {
                    const: 'Dúbravka',
                    title: 'Dúbravka',
                  },
                  {
                    const: 'Jarovce',
                    title: 'Jarovce',
                  },
                  {
                    const: 'Karlova Ves',
                    title: 'Karlova Ves',
                  },
                  {
                    const: 'Lamač',
                    title: 'Lamač',
                  },
                  {
                    const: 'Nivy',
                    title: 'Nivy',
                  },
                  {
                    const: 'Nové Mesto',
                    title: 'Nové Mesto',
                  },
                  {
                    const: 'Petržalka',
                    title: 'Petržalka',
                  },
                  {
                    const: 'Podunajské Biskupice',
                    title: 'Podunajské Biskupice',
                  },
                  {
                    const: 'Rača',
                    title: 'Rača',
                  },
                  {
                    const: 'Rusovce',
                    title: 'Rusovce',
                  },
                  {
                    const: 'Ružinov',
                    title: 'Ružinov',
                  },
                  {
                    const: 'Staré mesto',
                    title: 'Staré mesto',
                  },
                  {
                    const: 'Trnávka',
                    title: 'Trnávka',
                  },
                  {
                    const: 'Vajnory',
                    title: 'Vajnory',
                  },
                  {
                    const: 'Vinohrady',
                    title: 'Vinohrady',
                  },
                  {
                    const: 'Vrakuňa',
                    title: 'Vrakuňa',
                  },
                  {
                    const: 'Záhorská Bystrica',
                    title: 'Záhorská Bystrica',
                  },
                ],
              },
            },
          },
          required: [
            'stavbaNazov',
            'stavbaDruh',
            'stavbaUlica',
            'stavbaParcela',
            'stavbaKataster',
          ],
        },
      },
    },
    {
      properties: {
        konanie: {
          type: 'object',
          title: 'Typ konania na stavebnom úrade',
          properties: {
            konanieTyp: {
              title: 'Typ konania',
              type: 'string',
              default: 'Územné konanie',
              enum: [
                'Územné konanie',
                'Územné konanie spojené so stavebným konaním',
                'Zmena stavby pred dokončením',
                'Zmena v užívaní stavby',
                'Konanie o dodatočnom povolení stavby',
              ],
            },
          },
          required: ['konanieTyp'],
          allOf: [
            {
              if: {
                properties: {
                  konanieTyp: {
                    const: 'Konanie o dodatočnom povolení stavby',
                  },
                },
              },
              then: {
                properties: {
                  ziadostOdovodnenie: {
                    type: 'string',
                    title: 'Upresnenie konania',
                    default:
                      'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                    enum: [
                      'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                      'Dodatočné povolenie zmeny stavby pred dokončením',
                    ],
                  },
                },
                allOf: [
                  {
                    if: {
                      properties: {
                        ziadostOdovodnenie: {
                          const:
                            'Dodatočné povolenie zmeny stavby pred dokončením',
                        },
                      },
                    },
                    then: {
                      properties: {
                        stavbaFotodokumentacia: {
                          type: 'array',
                          title: 'Fotodokumentácia stavby',
                          items: {
                            type: 'string',
                            format: 'file',
                          },
                        },
                        stavbaPisomnosti: {
                          type: 'array',
                          title: 'Relevantné písomnosti súvisiace so stavbou',
                          items: {
                            type: 'string',
                            format: 'file',
                          },
                        },
                      },
                      required: ['stavbaFotodokumentacia', 'stavbaPisomnosti'],
                    },
                  },
                ],
                required: ['ziadostOdovodnenie'],
              },
            },
          ],
        },
      },
    },
  ],
} as JsonSchema

export const xmlTemplate = `<?xml version="1.0" encoding="utf-8"?>
<E-form xmlns="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1"
        xsi:schemaLocation="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Meta>
    <ID>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</ID>
    <Name>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</Name>
    <Gestor></Gestor>
    <RecipientId></RecipientId>
    <Version>0.1</Version>
    <ZepRequired>false</ZepRequired>
    <EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid>
    <SenderID>mailto:hruska@example.com</SenderID>
  </Meta>
</E-form>`

export const testData = `<?xml version="1.0" encoding="utf-8"?><E-form xmlns="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1" xsi:schemaLocation="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Meta><ID>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</ID><Name>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</Name><Gestor/><RecipientId/><Version>0.1</Version><ZepRequired>false</ZepRequired><EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid><SenderID>mailto:hruska@example.com</SenderID></Meta><Body><Prilohy><ProjektovaDokumentacia><Nazov>string</Nazov><Prilozena>true</Prilozena></ProjektovaDokumentacia></Prilohy><Ziadatel><ZiatetelTyp>Právnicka osoba</ZiatetelTyp><ZiadatelObchodneMeno>string</ZiadatelObchodneMeno><ZiadatelIco>-2736</ZiadatelIco><ZiadatelMiestoPodnikania>string</ZiadatelMiestoPodnikania><ZiadatelAdresaSidla>string</ZiadatelAdresaSidla><ZiadatelMestoPsc><ZiadatelPsc>string</ZiadatelPsc><ZiadatelMesto><Code>mesto</Code><Name>mesto</Name><WsEnumCode>undefined</WsEnumCode></ZiadatelMesto></ZiadatelMestoPsc><ZiadatelKontaktnaOsoba>test</ZiadatelKontaktnaOsoba><ZiadatelEmail>ziadatel@test.sk</ZiadatelEmail><ZiadatelTelefon>+449</ZiadatelTelefon></Ziadatel><Investor><InvestorZiadatelom>true</InvestorZiadatelom><Splnomocnenie><Nazov>string</Nazov><Prilozena>true</Prilozena></Splnomocnenie><InvestorTyp>Právnicka osoba</InvestorTyp><InvestorMenoPriezvisko>Janko Hrasko</InvestorMenoPriezvisko><InvestorMiestoPodnikania>string</InvestorMiestoPodnikania><InvestorMestoPsc><InvestorPsc>string</InvestorPsc><InvestorMesto><Code>mesto</Code><Name>mesto</Name><WsEnumCode>undefined</WsEnumCode></InvestorMesto></InvestorMestoPsc><InvestorEmail>investor@test.sk</InvestorEmail><InvestorTelefon>+4</InvestorTelefon></Investor><Projektant><ProjektantEmail>projektant@test.sk</ProjektantEmail><DatumSpracovania>1989-03-27</DatumSpracovania><ProjektantTelefon>+5</ProjektantTelefon><AutorizacneOsvedcenie>string</AutorizacneOsvedcenie><ProjektantMenoPriezvisko>Fero Mrkva</ProjektantMenoPriezvisko></Projektant><Stavba><StavbaDruh>Bytový dom</StavbaDruh><StavbaNazov>string</StavbaNazov><StavbaUlica>string</StavbaUlica><StavbaParcela>string</StavbaParcela><StavbaKataster>Karlova Ves</StavbaKataster></Stavba><Konanie><KonanieTyp>Konanie o dodatočnom povolení stavby</KonanieTyp><ZiadostOdovodnenie>Dodatočné povolenie zmeny stavby pred dokončením</ZiadostOdovodnenie><StavbaPisomnosti><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaPisomnosti><StavbaPisomnosti><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaPisomnosti><StavbaFotodokumentacia><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaFotodokumentacia><StavbaFotodokumentacia><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaFotodokumentacia></Konanie></Body></E-form>`

export const testJsonData = {
  prilohy: {
    projektovaDokumentacia: ['string'],
  },
  ziadatel: {
    ziatetelTyp: 'Právnicka osoba',
    ziadatelObchodneMeno: 'string',
    ziadatelIco: -2736,
    ziadatelMiestoPodnikania: 'string',
    ziadatelAdresaSidla: 'string',
    ziadatelMestoPsc: {
      ziadatelMesto: 'mesto',
      ziadatelPsc: 'string',
    },
    ziadatelKontaktnaOsoba: 'test',
    ziadatelEmail: 'ziadatel@test.sk',
    ziadatelTelefon: '+449',
  },
  investor: {
    investorZiadatelom: true,
    splnomocnenie: ['string'],
    investorTyp: 'Právnicka osoba',
    investorMenoPriezvisko: 'Janko Hrasko',
    investorMiestoPodnikania: 'string',
    investorMestoPsc: {
      investorMesto: 'mesto',
      investorPsc: 'string',
    },
    investorEmail: 'investor@test.sk',
    investorTelefon: '+4',
  },
  projektant: {
    projektantMenoPriezvisko: 'Fero Mrkva',
    projektantEmail: 'projektant@test.sk',
    projektantTelefon: '+5',
    autorizacneOsvedcenie: 'string',
    datumSpracovania: '1989-03-27',
  },
  stavba: {
    stavbaNazov: 'string',
    stavbaDruh: 'Bytový dom',
    stavbaUlica: 'string',
    stavbaParcela: 'string',
    stavbaKataster: ['Karlova Ves'],
  },
  konanie: {
    konanieTyp: 'Konanie o dodatočnom povolení stavby',
    ziadostOdovodnenie: 'Dodatočné povolenie zmeny stavby pred dokončením',
    stavbaFotodokumentacia: ['string', 'string'],
    stavbaPisomnosti: ['string', 'string'],
  },
}

/* eslint-enable unicorn/no-thenable */
/* eslint-enable no-secrets/no-secrets */
/* eslint-enable pii/no-email */
