import { createCondition, createStringItems } from '../../generator/helpers'
import { select } from '../../generator/functions/select'
import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'
import { getObjednavatelZiadatelStep } from './shared/getObjednavatelZiadatelStep'

export default schema(
  {
    title: 'Objednávka vytýčenia podzemných vedení verejného osvetlenia',
  },
  {},
  [
    getObjednavatelZiadatelStep('objednavatel'),
    step('udaje', { title: 'Údaje' }, [
      object(
        'fakturacneUdaje',
        { required: true },
        { objectDisplay: 'boxed', title: 'Fakturačné údaje' },
        [
          input(
            'adresaSidla',
            { title: 'Adresa sídla', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
          input(
            'psc',
            { type: 'ba-slovak-zip', title: 'PSČ', required: true },
            { selfColumn: '1/4' },
          ),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            {
              helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu',
            },
          ),
        ],
      ),
      object(
        'udajeObjednavky',
        { required: true },
        { objectDisplay: 'boxed', title: 'Údaje objednávky' },
        [
          input(
            'dovodVytycenia',
            { title: 'Dôvod vytýčenia', required: true, type: 'text' },
            {
              helptext:
                'Napríklad: vytýčenie káblovej poruchy, za účelom rozkopávky, vybudovanie inžinierskych sietí...',
            },
          ),
          input(
            'pozadovaneMiestoPlnenia',
            { title: 'Požadované miesto plnenia', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          radioGroup(
            'viacKatastralneUzemia',
            {
              type: 'boolean',
              title: 'Nachádza sa adresa stavby v dvoch alebo viacerých katastrálnych územiach?',
              required: true,
              items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie', isDefault: true },
              ],
            },
            {
              variant: 'boxed',
              orientations: 'row',
            },
          ),
          conditionalFields(createCondition([[['viacKatastralneUzemia'], { const: true }]]), [
            selectMultiple(
              'katastralneUzemia',
              {
                title: 'Katastrálne územia',
                required: true,
                items: createStringItems([
                  'Čunovo',
                  'Devín',
                  'Devínska Nová Ves',
                  'Dúbravka',
                  'Jarovce',
                  'Karlova Ves',
                  'Lamač',
                  'Nové Mesto',
                  'Vinohrady',
                  'Petržalka',
                  'Podunajské Biskupice',
                  'Rača',
                  'Rusovce',
                  'Ružinov',
                  'Trnávka',
                  'Nivy',
                  'Staré Mesto',
                  'Vajnory',
                  'Vrakuňa',
                  'Záhorská Bystrica',
                ]),
              },
              {
                helptext:
                  'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
              },
            ),
          ]),
          conditionalFields(createCondition([[['viacKatastralneUzemia'], { const: false }]]), [
            select(
              'katastralneUzemie',
              {
                title: 'Katastrálne územie',
                required: true,
                items: createStringItems([
                  'Čunovo',
                  'Devín',
                  'Devínska Nová Ves',
                  'Dúbravka',
                  'Jarovce',
                  'Karlova Ves',
                  'Lamač',
                  'Nové Mesto',
                  'Vinohrady',
                  'Petržalka',
                  'Podunajské Biskupice',
                  'Rača',
                  'Rusovce',
                  'Ružinov',
                  'Trnávka',
                  'Nivy',
                  'Staré Mesto',
                  'Vajnory',
                  'Vrakuňa',
                  'Záhorská Bystrica',
                ]),
              },
              {
                helptext:
                  'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
              },
            ),
          ]),
          input(
            'druhStavby',
            { title: 'Druh stavby', required: false, type: 'text' },
            { helptext: 'Napríklad: telekomunikačná líniová stavba' },
          ),
          datePicker(
            'pozadovanyTerminPlnenia',
            { title: 'Požadovaný termín plnenia', required: true },
            { helptext: 'Štandardný termín na vybavenie objednávky je 30 dní' },
          ),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'informativnyZakresSieti',
        {
          title: 'Informatívny zákres sietí vydaný Technickými sieťami Bratislava, a.s.',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'Požiadať o informatívny zákres vydaný Technickými sieťami Bratislava, a.s. môžete formou spoplatnenej služby Objednávka informatívneho zákresu sietí',
          accept: '.pdf,.jpg,.jpeg,.png',
        },
      ),
    ]),
  ],
)

export const objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractEmail = (
  formData: GenericObjectType,
) => {
  return safeString(formData.objednavatel?.email)
}

export const objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractName = (
  formData: GenericObjectType,
) => {
  if (
    formData.objednavatel?.objednavatelTyp === 'fyzickaOsoba' ||
    formData.objednavatel?.objednavatelTyp === 'fyzickaOsobaPodnikatel'
  ) {
    return safeString(formData.objednavatel?.meno)
  }
  if (formData.objednavatel?.objednavatelTyp === 'pravnickaOsoba') {
    return safeString(formData.objednavatel?.obchodneMeno)
  }
}
