import { createCondition, createStringItems, createStringItemsV2 } from '../../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../../shared/fields'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../../form-utils/safeData'
import { select } from '../../../generator/functions/select'
import { selectMultiple } from '../../../generator/functions/selectMultiple'
import { input } from '../../../generator/functions/input'
import { number } from '../../../generator/functions/number'
import { radioGroup } from '../../../generator/functions/radioGroup'
import { checkbox } from '../../../generator/functions/checkbox'
import { datePicker } from '../../../generator/functions/datePicker'
import { customComponentsField } from '../../../generator/functions/customComponentsField'
import { object } from '../../../generator/object'
import { step } from '../../../generator/functions/step'
import { conditionalFields } from '../../../generator/functions/conditionalFields'
import { fileUploadMultiple } from '../../../generator/functions/fileUploadMultiple'

export enum ZevoType {
  EnergetickeZhodnotenieOdpaduVZevo,
  UzatvorenieZmluvyONakladaniSOdpadom,
}

export const getZevoSchema = (type: ZevoType) => [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        items: createStringItems([
          'Fyzická osoba',
          'Právnická osoba',
          'Právnická osoba s povolením na vstup do ZEVO',
        ]),
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Fyzická osoba' }]]), [
      object('menoPriezvisko', { required: true }, {}, [
        input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
        input(
          'priezvisko',
          { title: 'Priezvisko', required: true, type: 'text' },
          { selfColumn: '2/4' },
        ),
      ]),
      sharedAddressField('adresaObyvatel', 'Adresa trvalého pobytu', true),
    ]),
    conditionalFields(
      createCondition([
        [
          ['ziadatelTyp'],
          { enum: ['Právnická osoba', 'Právnická osoba s povolením na vstup do ZEVO'] },
        ],
      ]),
      [
        input('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
        conditionalFields(
          createCondition([
            [['ziadatelTyp'], { const: 'Právnická osoba s povolením na vstup do ZEVO' }],
          ]),
          [
            input(
              'cisloPovoleniaNaVstup',
              { type: 'text', title: 'Číslo povolenia na vstup', required: true },
              {
                helptext: 'Vo formáte: 123/45 alebo 1234/45/2026 (číslo Objednávky alebo Zmluvy)',
              },
            ),
          ],
        ),
        sharedAddressField('adresaPravnickaOsoba', 'Adresa sídla organizácie', true),
        input('ico', { type: 'text', title: 'IČO', required: true }, {}),
        input('dic', { type: 'text', title: 'DIČ', required: true }, {}),
        checkbox(
          'platcaDph',
          { title: 'Som platca DPH?' },
          { checkboxLabel: 'Som platca DPH', variant: 'boxed' },
        ),
        conditionalFields(createCondition([[['platcaDph'], { const: true }]]), [
          input('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
        ]),
      ],
    ),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
      input(
        'konatel',
        { type: 'text', title: 'Konateľ', required: true },
        { helptext: 'Uveďte meno a priezvisko konateľa' },
      ),
      input(
        'zastupeny',
        {
          type: 'text',
          title: 'Zastúpený - na základe splnomocnenia',
          required: true,
        },
        {
          helptext: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia',
        },
      ),
    ]),
    conditionalFields(
      createCondition([
        [
          ['ziadatelTyp'],
          { enum: ['Právnická osoba', 'Právnická osoba s povolením na vstup do ZEVO'] },
        ],
      ]),
      [
        input(
          'kontaktnaOsoba',
          { type: 'text', title: 'Meno kontaktnej osoby', required: true },
          {},
        ),
      ],
    ),
    sharedPhoneNumberField('telefon', true),
    input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    ...(type === ZevoType.EnergetickeZhodnotenieOdpaduVZevo
      ? [
          radioGroup(
            'vyberSluzby',
            {
              type: 'string',
              title: 'Výber služby',
              required: true,
              items: createStringItemsV2([
                {
                  label: 'Mechanická vykládka a zhodnotenie odpadu podľa integrovaného povolenia',
                  description: 'Dostupné v pondelok až sobotu',
                },
                {
                  label: 'Ručná vykládka a zhodnotenie odpadu podľa integrovaného povolenia',
                  description: 'Dostupné v utorok, štvrtok a sobotu',
                },
                {
                  label: 'Podrvenie a zhodnotenie odpadu vysypaním do zásobníka pod dozorom',
                  description: 'Dostupné v utorok',
                },
              ]),
            },
            { variant: 'boxed', orientations: 'column' },
          ),
          datePicker(
            'preferovanyDatumDovozu',
            {
              title: 'Preferovaný dátum dovozu odpadu',
              required: true,
            },
            {},
          ),
          conditionalFields(
            createCondition([
              [
                ['vyberSluzby'],
                {
                  const: 'Mechanická vykládka a zhodnotenie odpadu podľa integrovaného povolenia',
                },
              ],
            ]),
            [
              select(
                'preferovanyCasMechanickaVykladka',
                {
                  title: 'Preferovaný čas dovozu odpadu',
                  required: true,
                  items: createStringItems(
                    [
                      '06:00',
                      '06:30',
                      '07:00',
                      '07:30',
                      '08:00',
                      '08:30',
                      '09:00',
                      '09:30',
                      '10:00',
                      '10:30',
                      '11:00',
                      '11:30',
                      '12:00 (dostupné iba v pondelok až piatok)',
                      '12:30 (dostupné iba v pondelok až piatok)',
                      '13:00 (dostupné iba v pondelok až piatok)',
                      '13:30 (dostupné iba v pondelok až piatok)',
                      '14:00 (dostupné iba v pondelok až piatok)',
                      '14:30 (dostupné iba v pondelok až piatok)',
                      '15:00 (dostupné iba v pondelok až piatok)',
                    ],
                    false,
                  ),
                },
                {},
              ),
            ],
          ),
          conditionalFields(
            createCondition([
              [
                ['vyberSluzby'],
                {
                  const: 'Ručná vykládka a zhodnotenie odpadu podľa integrovaného povolenia',
                },
              ],
            ]),
            [
              select(
                'preferovanyCasDovozuRucnaVykladka',
                {
                  title: 'Preferovaný čas dovozu odpadu',
                  required: true,
                  items: createStringItems(
                    [
                      '06:00',
                      '07:00',
                      '08:00',
                      '09:00',
                      '10:00',
                      '11:00',
                      '12:00 (dostupné iba v utorok a štvrtok)',
                    ],
                    false,
                  ),
                },
                {},
              ),
            ],
          ),
          conditionalFields(
            createCondition([
              [
                ['vyberSluzby'],
                {
                  const: 'Podrvenie a zhodnotenie odpadu vysypaním do zásobníka pod dozorom',
                },
              ],
            ]),
            [
              select(
                'preferovanyCasPodrvenie',
                {
                  title: 'Preferovaný čas dovozu odpadu',
                  required: true,
                  items: createStringItems(['09:00', '10:00', '11:00', '12:00'], false),
                },
                {},
              ),
            ],
          ),
        ]
      : []),
    conditionalFields(
      createCondition([
        [
          ['ziadatelTyp'],
          { enum: ['Právnická osoba', 'Právnická osoba s povolením na vstup do ZEVO'] },
        ],
      ]),
      [
        object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
          radioGroup(
            'sposobPlatby',
            {
              type: 'string',
              title: 'Spôsob platby',
              required: true,
              items: createStringItems(['Platba kartou', 'Platba na faktúru']),
            },
            { variant: 'boxed', orientations: 'column' },
          ),
          conditionalFields(createCondition([[['sposobPlatby'], { const: 'Platba na faktúru' }]]), [
            input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
            checkbox(
              'elektronickaFaktura',
              {
                title: 'Súhlasím so zaslaním elektronickej faktúry',
              },
              {
                helptext:
                  'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
                checkboxLabel: 'Súhlasím so zaslaním elektronickej faktúry',
                variant: 'boxed',
              },
            ),
            conditionalFields(createCondition([[['elektronickaFaktura'], { const: true }]]), [
              input(
                'emailPreFaktury',
                {
                  type: 'email',
                  title: 'E-mail pre zasielanie elektronických faktúr',
                  required: true,
                },
                {},
              ),
            ]),
          ]),
        ]),
      ],
    ),
  ]),
  type === ZevoType.EnergetickeZhodnotenieOdpaduVZevo
    ? step('povodcaOdpadu', { title: 'Identifikačné údaje pôvodcu odpadu' }, [
        radioGroup(
          'stePovodcaOdpadu',
          {
            type: 'boolean',
            title: 'Ste zároveň aj pôvodca odpadu?',
            required: true,
            items: [
              { value: true, label: 'Áno', isDefault: true },
              { value: false, label: 'Nie' },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
            helptext:
              'Definícia zo Zákona č. 79/2015 Z. z. o odpadoch v znení neskorších predpisov',
          },
        ),
        conditionalFields(createCondition([[['stePovodcaOdpadu'], { const: false }]]), [
          radioGroup(
            'typPovodcuOdpadu',
            {
              type: 'string',
              title: 'Typ pôvodcu odpadu',
              required: true,
              items: createStringItems(['Fyzická osoba', 'Právnická osoba']),
            },
            { variant: 'boxed', orientations: 'column' },
          ),
          conditionalFields(
            createCondition([[['typPovodcuOdpadu'], { const: 'Právnická osoba' }]]),
            [
              input(
                'nazovOrganizacie',
                { type: 'text', title: 'Názov organizácie', required: true },
                {},
              ),
              sharedAddressField('sidloOrganizacie', 'Adresa sídla organizácie', true),
              input('ico', { type: 'text', title: 'IČO', required: true }, {}),
            ],
          ),
          conditionalFields(createCondition([[['typPovodcuOdpadu'], { const: 'Fyzická osoba' }]]), [
            input('meno', { type: 'text', title: 'Meno', required: true }, {}),
            input('priezvisko', { type: 'text', title: 'Priezvisko', required: true }, {}),
            sharedAddressField('adresa', 'Adresa', true),
          ]),
          input(
            'emailPovodcuOdpadu',
            { title: 'E-mail pôvodcu odpadu', required: true, type: 'email' },
            {},
          ),
        ]),
      ])
    : null,
  type === ZevoType.EnergetickeZhodnotenieOdpaduVZevo
    ? step('drzitelOdpadu', { title: 'Identifikačné údaje držiteľa odpadu' }, [
        radioGroup(
          'steDrzitelOdpadu',
          {
            type: 'boolean',
            title: 'Ste zároveň aj držiteľ odpadu?',
            required: true,
            items: [
              { value: true, label: 'Áno', isDefault: true },
              { value: false, label: 'Nie' },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
            helptext:
              'Definícia zo Zákona č. 79/2015 Z. z. o odpadoch v znení neskorších predpisov',
          },
        ),
        conditionalFields(createCondition([[['steDrzitelOdpadu'], { const: false }]]), [
          radioGroup(
            'typDrzitelaOdpadu',
            {
              type: 'string',
              title: 'Typ držiteľa odpadu',
              required: true,
              items: createStringItems(['Fyzická osoba', 'Právnická osoba']),
            },
            { variant: 'boxed', orientations: 'column' },
          ),
          conditionalFields(
            createCondition([[['typDrzitelaOdpadu'], { const: 'Právnická osoba' }]]),
            [
              input(
                'nazovOrganizacie',
                { type: 'text', title: 'Názov organizácie', required: true },
                {},
              ),
              sharedAddressField('sidloOrganizacie', 'Adresa sídla organizácie', true),
              input('ico', { type: 'text', title: 'IČO', required: true }, {}),
            ],
          ),
          conditionalFields(
            createCondition([[['typDrzitelaOdpadu'], { const: 'Fyzická osoba' }]]),
            [
              input('meno', { type: 'text', title: 'Meno', required: true }, {}),
              input('priezvisko', { type: 'text', title: 'Priezvisko', required: true }, {}),
              sharedAddressField('adresa', 'Adresa', true),
            ],
          ),
          input(
            'emailDrzitelaOdpadu',
            { title: 'E-mail držiteľa odpadu', required: true, type: 'email' },
            {},
          ),
        ]),
      ])
    : null,
  step('vyberDruhuOdpadu', { title: 'Výber druhu odpadu na základe katalogizácie' }, [
    selectMultiple(
      'separovaneZlozky',
      {
        title: '20 01 Separovane zbierané zložky komunálnych odpadov (okrem 15 01)',
        items: [
          { value: '20_01_01', label: '20 01 01 Papier a lepenka' },
          {
            value: '20_01_08',
            label: '20 01 08 Biologicky rozložiteľný kuchynský a reštauračný odpad',
          },
          { value: '20_01_10', label: '20 01 10 Šatstvo' },
          { value: '20_01_11', label: '20 01 11 Textílie' },
          { value: '20_01_25', label: '20 01 25 Jedlé oleje a tuky' },
          {
            value: '20_01_28',
            label:
              '20 01 28 Farby, tlačiarenské farby, lepidlá a živice iné ako uvedené v 20 01 27',
          },
          { value: '20_01_30', label: '20 01 30 Detergenty iné ako uvedené v 20 01 29' },
          { value: '20_01_32', label: '20 01 32 Liečivá iné ako uvedené v 20 01 31' },
          { value: '20_01_38', label: '20 01 38 Drevo iné ako uvedené v 20 01 37' },
          { value: '20_01_39', label: '20 01 39 Plasty' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZoZahrad',
      {
        title: '20 02 Odpady zo záhrad a z parkov (vrátane odpadu z cintorínov)',
        items: [
          {
            value: '20_02_01',
            label: '20 02 01 Biologicky rozložiteľný odpad s max. obsahom biologickej zložky 40%',
          },
          { value: '20_02_03', label: '20 02 03 Iné biologicky nerozložiteľné odpady' },
        ],
      },
      {},
    ),
    selectMultiple(
      'ineKomunalneOdpady',
      {
        title: '20 03 Iné komunálne odpady',
        items: [
          { value: '20_03_01', label: '20 03 01 Zmesový komunálny odpad' },
          { value: '20_03_02', label: '20 03 02 Odpad z trhovísk' },
          { value: '20_03_03', label: '20 03 03 Odpad z čistenia ulíc' },
          { value: '20_03_07', label: '20 03 07 Objemný odpad' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZAerobnejUpravy',
      {
        title: '19 05 Odpady z aeróbnej úpravy tuhých odpadov',
        items: [
          {
            value: '19_05_01',
            label: '19 05 01 Nekompostované zložky komunálnych odpadov a podobných odpadov',
          },
          {
            value: '19_05_02',
            label: '19 05 02 Nekompostované zložky živočíšneho a rastlinného odpadu',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZCistiarni',
      {
        title: '19 08 Odpady z čistiarní odpadových vôd inak nešpecifikované',
        items: [
          { value: '19_08_01', label: '19 08 01 Zhrabky z hrablíc' },
          { value: '19_08_02', label: '19 08 02 Odpad z lapačov piesku' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZUpravyVody',
      {
        title: '19 09 Odpady z úpravy pitnej vody alebo vody na priemyselné použitie',
        items: [
          { value: '19_09_01', label: '19 09 01 Tuhé odpady z primárnych filtrov a hrablíc' },
          { value: '19_09_04', label: '19 09 04 Použité aktívne uhlie' },
          { value: '19_09_05', label: '19 09 05 Nasýtené alebo použité iontomeničové živice' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZMechanickehoSpracovania',
      {
        title:
          '19 12 Odpady z mechanického spracovania odpadu (napr. triedenia, drvenia, lisovania, hutnenia a peletizovania) inak nešpecifikované',
        items: [
          { value: '19_12_01', label: '19 12 01 Papier a lepenka' },
          { value: '19_12_04', label: '19 12 04 Plasty a guma' },
          { value: '19_12_07', label: '19 12 07 Drevo iné ako uvedené v 19 12 06' },
          { value: '19_12_08', label: '19 12 08 Textílie' },
          { value: '19_12_10', label: '19 12 10 Horľavý odpad (palivo z odpadov)' },
          {
            value: '19_12_12',
            label:
              '19 12 12 Iné odpady vrátane zmiešaných materiálov z mechanického spracovania odpadu iné ako uvedené v 19 12 11',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPorodnictva',
      {
        title:
          '18 01 Odpady z pôrodníckej starostlivosti, diagnostiky, liečby alebo zdravotnej prevencie',
        items: [
          {
            value: '18_01_04',
            label:
              '18 01 04 Odpady, ktorých zber a zneškodňovanie nepodliehajú osobitným požiadavkám z hľadiska prevencie nákazy (napr. obväzy, sadrové odtlačky a obväzy, posteľná bielizeň, jednorazové odevy, plienky)',
          },
          { value: '18_01_09', label: '18 01 09 Liečivá iné ako uvedené v 18 01 08' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZVeterinarnehoVyskumu',
      {
        title:
          '18 02 Odpady z veterinárneho výskumu, diagnostiky, liečby a preventívnej starostlivosti',
        items: [
          {
            value: '18_02_03',
            label:
              '18 02 03 Odpady, ktorých zber a zneškodňovanie nepodliehajú osobitným požiadavkám z hľadiska prevencie nákazy',
          },
          { value: '18_02_08', label: '18 02 08 Liečivá iné ako uvedené v 18 02 07' },
        ],
      },
      {},
    ),
    selectMultiple(
      'drevoSkloPlasty',
      {
        title: '17 02 Drevo, sklo a plasty',
        items: [
          { value: '17_02_01', label: '17 02 01 Drevo' },
          { value: '17_02_03', label: '17 02 03 Plasty' },
        ],
      },
      {},
    ),
    selectMultiple(
      'izolacneMaterialy',
      {
        title: '17 06 Izolačné materiály a stavebné materiály obsahujúce azbest',
        items: [
          {
            value: '17_06_04',
            label: '17 06 04 Izolačné materiály iné ako uvedené v 17 06 01 a 17 06 03',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'ineOdpadyZoStavieb',
      {
        title: '17 09 Iné odpady zo stavieb a demolácií',
        items: [
          {
            value: '17_09_04',
            label:
              '17 09 04 Zmiešané odpady zo stavieb a demolácií iné ako uvedené v 17 09 01, 17 09 02, a 17 09 03',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'stareVozidla',
      {
        title:
          '16 01 Staré vozidlá z rozličných dopravných prostriedkov (vrátane strojov neurčených na cestnú premávku) a odpady z demontáže starých vozidiel a údržby vozidiel (okrem 13, 14, 16 06 a 16 08)',
        items: [
          { value: '16_01_19', label: '16 01 19 Plasty' },
          { value: '16_01_22', label: '16 01 22 Časti inak nešpecifikované' },
        ],
      },
      {},
    ),
    selectMultiple(
      'vyrobneZarze',
      {
        title: '16 03 Výrobné šarže a výrobky nevyhovujúcej kvality',
        items: [
          { value: '16_03_04', label: '16 03 04 Anorganické výrobky iné ako uvedené v 16 03 03' },
          { value: '16_03_06', label: '16 03 06 Organické výrobky iné ako uvedené v 16 03 05' },
        ],
      },
      {},
    ),
    selectMultiple(
      'obaly',
      {
        title: '15 01 Obaly (vrátane odpadových obalov zo separovaného zberu komunálnych odpadov)',
        items: [
          { value: '15_01_01', label: '15 01 01 Obaly z papiera a lepenky' },
          { value: '15_01_02', label: '15 01 02 Obaly z plastov' },
          { value: '15_01_03', label: '15 01 03 Obaly z dreva' },
          { value: '15_01_04', label: '15 01 04 Obaly z kovu' },
          { value: '15_01_05', label: '15 01 05 Kompozitné obaly' },
          { value: '15_01_06', label: '15 01 06 Zmiešané obaly' },
          { value: '15_01_09', label: '15 01 09 Obaly z textilu' },
        ],
      },
      {},
    ),
    selectMultiple(
      'absorbenty',
      {
        title: '15 02 Absorbenty, filtračné materiály, handry na čistenie a ochranné odevy',
        items: [
          {
            value: '15_02_03',
            label:
              '15 02 03 Absorbenty, filtračné materiály, handry na čistenie a ochranné odevy iné ako uvedené v 15 02 02',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZTvarovania',
      {
        title:
          '12 01 Odpady z tvarovania a fyzikálnej a mechanickej úpravy povrchov kovov a plastov',
        items: [
          { value: '12_01_05', label: '12 01 05 Hobliny a triesky z plastov' },
          {
            value: '12_01_21',
            label: '12 01 21 Použité brúsne nástroje a brúsne materiály iné ako uvedené v 12 01 20',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZElektrarni',
      {
        title: '10 01 Odpady z elektrární a iných spaľovacích zariadení (okrem 19)',
        items: [{ value: '10_01_26', label: '10 01 26 Odpady z úpravy chladiacej vody' }],
      },
      {},
    ),
    selectMultiple(
      'odpadyZVyrobySkla',
      {
        title: '10 11 Odpady z výroby skla a sklených výrobkov',
        items: [{ value: '10_11_03', label: '10 11 03 Odpadové vláknité materiály na báze skla' }],
      },
      {},
    ),
    selectMultiple(
      'odpadyZFotografickehoPriemyslu',
      {
        title: '09 01 Odpady z fotografického priemyslu',
        items: [
          {
            value: '09_01_07',
            label:
              '09 01 07 Fotografický film a papiere obsahujúce striebro alebo zlúčeniny striebra',
          },
          {
            value: '09_01_08',
            label:
              '09 01 08 Fotografický film a papiere neobsahujúce striebro alebo zlúčeniny striebra',
          },
          { value: '09_01_10', label: '09 01 10 Jednorázové kamery bez batérií' },
          {
            value: '09_01_12',
            label: '09 01 12 Jednorázové kamery s batériami iné ako uvedené 09 01 11',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZFariebALakov',
      {
        title:
          '08 01 Odpady z výroby, spracovania, distribúcie, používania a odstraňovania farieb a lakov',
        items: [
          {
            value: '08_01_12',
            label: '08 01 12 Odpadové farby a laky iné ako uvedené v 08 01 11',
          },
          {
            value: '08_01_18',
            label: '08 01 18 Odpady z odstraňovania farby alebo laku iné ako uvedené v 08 01 17',
          },
          {
            value: '08_01_20',
            label:
              '08 01 20 Vodné suspenzie obsahujúce farby alebo laky iné ako uvedené v 08 01 19',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZInychNaterovychHmot',
      {
        title:
          '08 02 Odpady z výroby, spracovania, distribúcie a používania iných náterových hmôt (vrátane keramických materiálov)',
        items: [{ value: '08_02_01', label: '08 02 01 Odpadové náterové prášky' }],
      },
      {},
    ),
    selectMultiple(
      'odpadyZTlaciarenskychFarieb',
      {
        title: '08 03 Odpady z výroby, spracovania, distribúcie a používania tlačiarenských farieb',
        items: [
          {
            value: '08_03_13',
            label: '08 03 13 Odpadová tlačiarenská farba iná ako uvedená v 08 03 12',
          },
          {
            value: '08_03_18',
            label: '08 03 18 Odpadový toner do tlačiarne iný ako uvedený v 08 03 17',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZLepidiel',
      {
        title:
          '08 04 Odpady z výroby, spracovania, distribúcie a používania lepidiel a tesniacich materiálov (vrátane vodotesniacich výrobkov)',
        items: [
          {
            value: '08_04_10',
            label: '08 04 10 Odpadové lepidlá a tesniace materiály iné ako uvedené v 08 04 09',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPlastov',
      {
        title:
          '07 02 Odpady z výroby, spracovania, distribúcie a používania plastov, syntetického kaučuku a syntetických vlákien',
        items: [
          { value: '07_02_13', label: '07 02 13 Odpadový plast' },
          { value: '07_02_15', label: '07 02 15 Odpadové prísady iné ako uvedené v 07 02 14' },
          {
            value: '07_02_17',
            label: '07 02 17 Odpady obsahujúce silikóny iné ako uvedené v 07 02 16',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZFarmaceutickychVyrobkov',
      {
        title:
          '07 05 Odpady z výroby, spracovania, distribúcie a používania farmaceutických výrobkov',
        items: [{ value: '07_05_14', label: '07 05 14 Tuhé odpady iné ako uvedené v 07 05 13' }],
      },
      {},
    ),
    selectMultiple(
      'odpadyZTukovAMydiel',
      {
        title:
          '07 06 Odpady z výroby, spracovania, distribúcie a používania tukov, mazív, mydiel, detergentov, dezinfekčných a kozmetických prostriedkov',
        items: [
          {
            value: '07_06_12',
            label:
              '07 06 12 Kaly zo spracovania odpadu v mieste jeho vzniku iné ako uvedené v 07 06 11',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZCistychChemikalii',
      {
        title:
          '07 07 Odpady z výroby, spracovania, distribúcie a používania čistých chemikálií a chemických výrobkov inak nešpecifikovaných',
        items: [
          {
            value: '07_07_12',
            label:
              '07 07 12 Kaly zo spracovania odpadu v mieste jeho vzniku iné ako uvedené v 07 07 11',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPyrolyznehoSpracovania',
      {
        title: '05 06 Odpady z pyrolýzneho spracovania uhlia',
        items: [{ value: '05_06_04', label: '05 06 04 Odpad z chladiacich kolón' }],
      },
      {},
    ),
    selectMultiple(
      'odpadyZKoziarskehoPriemyslu',
      {
        title: '04 01 Odpady z kožiarskeho a kožušníckeho priemyslu',
        items: [{ value: '04_01_09', label: '04 01 09 Odpady z vypracúvania a apretácie' }],
      },
      {},
    ),
    selectMultiple(
      'odpadyZTextilnehoPriemyslu',
      {
        title: '04 02 Odpady z textilného priemyslu',
        items: [
          {
            value: '04_02_09',
            label:
              '04 02 09 Odpad z kompozitných materiálov (impregnovaný textil, elastomer, plastomér)',
          },
          {
            value: '04_02_10',
            label: '04 02 10 Organické látky prírodného pôvodu (napr. tuky, vosky)',
          },
          { value: '04_02_15', label: '04 02 15 Odpad z apretácie iný ako uvedený v 04 02 14' },
          { value: '04_02_17', label: '04 02 17 Farbivá a pigmenty iné ako uvedené v 04 02 16' },
          { value: '04_02_21', label: '04 02 21 Odpady z nespracovaných textilných vlákien' },
          { value: '04_02_22', label: '04 02 22 Odpady zo spracovaných textilných vlákien' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZoSpracovaniaDreva',
      {
        title: '03 01 Odpady zo spracovania dreva a z výroby reziva a nábytku',
        items: [
          { value: '03_01_01', label: '03 01 01 Odpadová kôra a korok' },
          {
            value: '03_01_05',
            label:
              '03 01 05 Piliny, hobliny, odrezky, odpadové rezivo alebo drevotrieskové/drevovláknité dosky, dyhy iné ako uvedené v 03 01 04',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZVyrobyPapiera',
      {
        title: '03 03 Odpady z výroby a spracovania celulózy, papiera a lepenky',
        items: [
          { value: '03_03_01', label: '03 03 01 Odpadová kôra a drevo' },
          {
            value: '03_03_07',
            label: '03 03 07 Mechanicky oddelené výmety z recyklácie papiera a lepenky',
          },
          {
            value: '03_03_08',
            label: '03 03 08 Odpady z triedenia papiera a lepenky určených na recykláciu',
          },
          {
            value: '03_03_10',
            label: '03 03 10 Výmety z vlákien, plnív a náterov z mechanickej separácie',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPolnohospodarstva',
      {
        title: '02 01 Odpady z poľnohospodárstva, záhradníctva, lesníctva, poľovníctva a rybárstva',
        items: [
          { value: '02_01_02', label: '02 01 02 Odpadové živočíšne tkanivá' },
          { value: '02_01_03', label: '02 01 03 Odpadové rastlinné tkanivá' },
          { value: '02_01_04', label: '02 01 04 Odpadové plasty (okrem obalov)' },
          {
            value: '02_01_06',
            label:
              '02 01 06 Zvierací trus, moč a hnoj (vrátane znečistenej slamy), kvapalné odpady, oddelene zhromažďované a spracúvané mimo miesta ich vzniku',
          },
          { value: '02_01_07', label: '02 01 07 Odpady z lesného hospodárstva' },
          { value: '02_01_09', label: '02 01 09 Agrochemické odpady iné ako uvedené v 02 01 08' },
          { value: '02_01_10', label: '02 01 10 Odpadové kovy' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPripravyMasa',
      {
        title:
          '02 02 Odpady z prípravy a spracovania mäsa, rýb a ostatných potravín živočíšneho pôvodu',
        items: [
          {
            value: '02_02_03',
            label: '02 02 03 Materiál nevhodný na spotrebu alebo spracovanie',
          },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZoSpracovaniaOvocia',
      {
        title:
          '02 03 Odpady zo spracovania ovocia, zeleniny, obilnín, jedlých olejov, kávy, čaju a tabaku',
        items: [
          { value: '02_03_02', label: '02 03 02 Odpady z konzervačných činidiel' },
          { value: '02_03_04', label: '02 03 04 Látky nevhodné na spotrebu alebo spracovanie' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPriemysluMliecnychVyrobkov',
      {
        title: '02 05 Odpady z priemyslu mliečnych výrobkov',
        items: [
          { value: '02_05_01', label: '02 05 01 Látky nevhodné na spotrebu alebo spracovanie' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZPekarenskehoACukrovinkarskeho',
      {
        title: '02 06 Odpady z pekárenského a cukrovinkárskeho priemyslu',
        items: [
          {
            value: '02_06_01',
            label: '02 06 01 Materiály nevhodné na spotrebu alebo spracovanie',
          },
          { value: '02_06_02', label: '02 06 02 Odpady z konzervačných činidiel' },
        ],
      },
      {},
    ),
    selectMultiple(
      'odpadyZVyrobyNapojov',
      {
        title: '02 07 Odpady z výroby alkoholických a nealkoholických nápojov',
        items: [
          {
            value: '02_07_04',
            label: '02 07 04 Materiály nevhodné na spotrebu alebo spracovanie',
          },
        ],
      },
      {},
    ),
  ]),
  type === ZevoType.EnergetickeZhodnotenieOdpaduVZevo
    ? step('informacieODovoze', { title: 'Informácie o dovoze odpadu do ZEVO' }, [
        input(
          'spzVozidla',
          {
            type: 'text',
            title: 'ŠPZ vozidla',
            required: true,
          },
          {},
        ),
        number(
          'predpokladaneMnozstvo',
          {
            title: 'Predpokladané množstvo dovezeného odpadu (kg)',
            required: true,
            minimum: 0,
          },
          {},
        ),
        fileUploadMultiple(
          'fotoOdpadu',
          {
            title: 'Foto odpadu',
            required: false,
          },
          {
            type: 'dragAndDrop',
            helptext:
              'Nahrajte fotografie odpadu, ktorý priveziete na zhodnotenie (povolené typy súborov jpg, gif, png, max. veľkosť 1 súboru 10 MB, maximálne 5 súborov.)',
          },
        ),
      ])
    : null,
  type === ZevoType.UzatvorenieZmluvyONakladaniSOdpadom
    ? step('informacieOMnozstve', { title: 'Informácie o indikovanom množstve' }, [
        number(
          'predpokladaneMnozstvo',
          {
            title: 'Prosím uveďte predpokladané množstvo odpadu za obdobie / rok (kg)',
            required: true,
            minimum: 0,
          },
          {},
        ),
      ])
    : null,
  step('suhlasy', { title: 'Súhlasy' }, [
    checkbox(
      'suhlasPodmienkyPrijatiaOdpadu',
      {
        title: 'Súhlas s Podmienkami prijatia odpadu do ZEVO',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel: 'Súhlasím s Podmienkami prijatia odpadu do ZEVO',
        variant: 'boxed',
      },
    ),
    customComponentsField(
      'suhlasPodmienkyPrijatiaOdpaduLink',
      {
        type: 'additionalLinks',
        props: {
          links: [
            {
              title: 'Podmienky prijatia odpadu do ZEVO',
              href: 'https://olo.sk/zevo/podmienky-prijatia-odpadu',
            },
          ],
        },
      },
      {},
    ),
    checkbox(
      'suhlasZasadySpravavania',
      {
        title: 'Súhlas so Zásadami správania sa zákazníkov v ZEVO',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel: 'Súhlasím so Zásadami správania sa zákazníkov v ZEVO',
        variant: 'boxed',
      },
    ),
    customComponentsField(
      'suhlasZasadySpravavaniaLink',
      {
        type: 'additionalLinks',
        props: {
          links: [
            {
              title: 'Zásady správania sa zákazníkov v ZEVO',
              href: 'https://olo.sk/zevo/zasady-spravania-sa-zakaznikov-zevo',
            },
          ],
        },
      },
      {},
    ),
    checkbox(
      'suhlasSVop',
      {
        title: 'Súhlas so Všeobecnými obchodnými podmienkami OLO',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel: 'Súhlasím s Všeobecnými obchodnými podmienkami OLO',
        variant: 'boxed',
      },
    ),
    customComponentsField(
      'suhlasSVopLink',
      {
        type: 'additionalLinks',
        props: {
          links: [
            {
              title: 'Všeobecné obchodné podmienky OLO',
              href: 'https://olo.sk/vseobecne-obchodne-podmienky',
            },
          ],
        },
      },
      {},
    ),
  ]),
]

export const zevoExtractEmail = (formData: GenericObjectType) =>
  safeString(formData.ziadatel?.email)

export const zevoExtractName = (formData: GenericObjectType) => {
  if (formData.ziadatel?.ziadatelTyp === 'Fyzická osoba') {
    return safeString(formData.ziadatel?.menoPriezvisko?.meno)
  }
  if (
    formData.ziadatel?.ziadatelTyp === 'Právnická osoba' ||
    formData.ziadatel?.ziadatelTyp === 'Právnická osoba s povolením na vstup do ZEVO'
  ) {
    return safeString(formData.ziadatel?.nazov)
  }
}
