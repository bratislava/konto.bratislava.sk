import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { createStringItems } from '../../generator/helpers'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { textArea } from '../../generator/functions/textArea'
import { checkbox } from '../../generator/functions/checkbox'
import { datePicker } from '../../generator/functions/datePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { schema } from '../../generator/functions/schema'

export default schema(
  {
    title: 'OLO Taxi',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'ziadatelTyp',
        {
          type: 'string',
          title: 'Žiadam ako',
          required: true,
          items: createStringItems(['Fyzická osoba']),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      object('menoPriezvisko', { required: true }, {}, [
        input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
        input(
          'priezvisko',
          { title: 'Priezvisko', required: true, type: 'text' },
          { selfColumn: '2/4' },
        ),
      ]),
      sharedAddressField('adresaTrvalehoPobytu', 'Adresa trvalého pobytu', true),
      sharedPhoneNumberField('telefon', true),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    ]),
    step('sluzba', { title: 'Služba' }, [
      input(
        'miestoDodania',
        {
          type: 'text',
          title: 'Miesto dodania / výkonu služby',
          required: true,
        },
        {
          placeholder: 'Zadajte presnú adresu',
          helptext: 'Vyplňte vo formáte ulica a číslo',
        },
      ),
      datePicker(
        'preferovanyDatumOdvozu',
        {
          title: 'Preferovaný dátum odvozu',
          required: true,
        },
        {
          helptext:
            'Vami zvolený dátum má iba informačný charakter. Objednávku je potrebné podať minimálne 2 pracovné dni pred zvoleným termínom. V prípade, ak vami zvolený termín nebude voľný, budeme vás kontaktovať.',
        },
      ),
      select(
        'preferovanyCasOdvozu',
        {
          title: 'Preferovaný čas odvozu',
          required: true,
          items: createStringItems(
            [
              '07:00 (pondelok - sobota)',
              '09:00 (pondelok - sobota)',
              '11:00 (pondelok - sobota)',
              '13:00 (pondelok - piatok)',
            ],
            false,
          ),
        },
        {},
      ),
      textArea(
        'mnozstvoADruhOdpadu',
        {
          title: 'Množstvo a druh odpadu',
          required: true,
        },
        {
          helptext: 'Špecifikujte druh odpadu, uveďte počet kusov alebo množstvo v m³.',
        },
      ),
      checkbox(
        'suhlasSPlatbou',
        {
          title: 'Vyjadrenie súhlasu s platbou',
          required: true,
          constValue: true,
        },
        {
          checkboxLabel: 'Súhlasím s platbou za službu OLO Taxi',
          variant: 'boxed',
        },
      ),
    ]),
    step('suhlasy', { title: 'Súhlasy' }, [
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
  ],
)

export const oloTaxiExtractEmail = (formData: GenericObjectType) =>
  safeString(formData.ziadatel?.email)

export const oloTaxiExtractName = (formData: GenericObjectType) =>
  safeString(formData.ziadatel?.menoPriezvisko?.meno)
