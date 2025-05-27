import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { step } from '../../generator/functions/step'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { getObjednavatelZiadatelStep } from './shared/getObjednavatelZiadatelStep'
import { esbsKatastralneUzemiaCiselnik } from '../../tax-form/mapping/shared/esbsCiselniky'
import { SchemalessFormDataExtractor } from 'src/form-utils/evaluateFormDataExtractor'

export default schema(
  {
    title: 'Žiadosť o stanovisko k projektovej dokumentácii',
  },
  [
    getObjednavatelZiadatelStep('ziadatel'),
    step('udajeOStavbe', { title: 'Údaje o stavbe' }, [
      input(
        'nazovStavby',
        { type: 'text', title: 'Názov stavby', required: true },
        {
          helptext: 'Napríklad: Polyfunkčný objekt ABC',
        },
      ),
      input(
        'adresaStavby',
        { type: 'text', title: 'Adresa stavby', required: true },
        { helptext: 'Vyplňte vo formáte ulica a číslo' },
      ),
      selectMultiple(
        'katastralneUzemie',
        {
          title: 'Katastrálne územie',
          required: true,
          items: esbsKatastralneUzemiaCiselnik.map(({ Name, Code }) => ({
            value: Code,
            label: Name,
          })),
        },
        {
          helptext: 'Vyberte jedno alebo viacero katastrálnych území zo zoznamu.',
        },
      ),
      datePicker(
        'predpokladanyTerminStavbyOd',
        { title: 'Predpokladaný termín stavby od', required: true },
        { selfColumn: '2/4' },
      ),
      datePicker(
        'predpokladanyTerminStavbyDo',
        { title: 'Predpokladaný termín stavby do', required: true },
        { selfColumn: '2/4' },
      ),
      radioGroup(
        'stupenProjektovejDokumentacie',
        {
          type: 'string',
          title: 'Stupeň projektovej dokumentácie',
          required: true,
          items: [
            {
              value: 'dokumentaciaPreUzemneneRozhodnutie',
              label: 'Dokumentácia pre územné rozhodnutie (DÚR)',
            },
            {
              value: 'dokumentaciaPreStavbnePovolenie',
              label: 'Dokumentácia pre stavebné povolenie (DSP)',
            },
            {
              value: 'dokumentaciaPreRealizaciuStavby',
              label: 'Dokumentácia pre realizáciu stavby (DRS)',
            },
          ],
        },
        { variant: 'boxed', orientations: 'column' },
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'technickaSprava',
        {
          title: 'Technická správa',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Technická správa s popisom navrhovaného technického riešenia.',
        },
      ),
      fileUploadMultiple(
        'vyznaceneZaujmoveUzemie',
        {
          title: 'Snímka z katastrálnej mapy s vyznačeným záujmovým územím',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: `Využiť môžete [katastrálnu mapu ZBGIS](https://zbgis.skgeodesy.sk/mapka/sk/kataster), kde nájdete požadované záujmové územie.

**Ako vytvoriť snímku?**
Prejdite do [katastrálnej mapy ZBGIS](https://zbgis.skgeodesy.sk/mapka/sk/kataster). Otvorením menu v ľavom hornom rohu nájdete funkciu „Meranie“. Tá vám umožní zaznačiť vaše záujmové územie na katastrálnej mape, pričom systém vám následne vypočíta výmeru označenej plochy. Pri položke „Meranie 1“ kliknite na ikonu troch bodiek v pravom hornom rohu a zvoľte možnosť „Tlačiť do PDF“. Dbajte na to, aby bolo celé vaše záujmové územie na snímke zreteľne viditeľné. Dokument uložte a následne ho nahrajte do poľa nižšie.`,
          helptextMarkdown: true,
        },
      ),
      fileUploadMultiple(
        'situacnyVykres',
        {
          title: 'Situačný výkres',
          required: true,
        },
        {
          type: 'dragAndDrop',
        },
      ),
      fileUploadMultiple(
        'svetelnoTechnickyVypocet',
        {
          title: 'Svetelno-technický výpočet',
          required: false,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Výpočet je nutné doložiť v prípade stavby verejného osvetlenia.',
        },
      ),
    ]),
  ],
)

type ExtractFormData = {
  ziadatel: { email: string } & (
    | {
        ziadatelTyp: 'fyzickaOsoba' | 'fyzickaOsobaPodnikatel'
        meno: string
      }
    | {
        ziadatelTyp: 'pravnickaOsoba'
        obchodneMeno: string
      }
  )
}

export const ziadostOStanoviskoKProjektovejDokumentaciiExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.ziadatel.email,
  }

export const ziadostOStanoviskoKProjektovejDokumentaciiExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      if (
        formData.ziadatel.ziadatelTyp === 'fyzickaOsoba' ||
        formData.ziadatel.ziadatelTyp === 'fyzickaOsobaPodnikatel'
      ) {
        return formData.ziadatel.meno
      } else if (formData.ziadatel.ziadatelTyp === 'pravnickaOsoba') {
        return formData.ziadatel.obchodneMeno
      }

      // Unreachable code, provided for type-safety to return `string` as required.
      throw new Error('Failed to extract the name.')
    },
  }
