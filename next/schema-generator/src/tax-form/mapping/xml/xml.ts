/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair */
import { Builder } from 'xml2js'

import { TaxFormData } from '../../types'
import { formatXsDateTimeXml } from './functions'
import { oddiel2Xml } from './oddiel2'
import { oddiel3JedenUcelXml } from './oddiel3JedenUcel'
import { oddiel3ViacereUcelyXml } from './oddiel3ViacereUcely'
import { oddiel4Xml } from './oddiel4'
import { oslobodenieXml } from './oslobodenie'
import { prilohyXml } from './prilohy'
import { udajeODanovnikoviXml } from './udajeODanovnikovi'

type JSONPrimitive = string | number | boolean | null | undefined
type JSONArray = Array<JSONValue>
type JSONObject = { [key: string]: JSONValue }
type JSONValue = JSONPrimitive | JSONArray | JSONObject

/**
 * Recursively removes all subtrees from a JSON object or array that do not contain a primitive value.
 * Empty objects and arrays are considered as having no value and are also removed.
 *
 * JSON generated from the mapping contains lot of `undefined` values, as they are not checked for each key whether
 * the respective value exists, this makes the XML invalid.
 *
 * For example, in this:
 * ``
 * {
 *   "WithValue": {
 *       "Key": "Value",
 *   },
 *   "WithoutValue": [
 *       {
 *          "WithoutValueKey: {}
 *       },
 *       []
 *   ]
 * }
 * ```
 * the `WithoutValue` subtree is removed.
 */
export const removeEmptySubtrees = <T extends JSONValue>(objOrArrayOrValue: T): T | null => {
  if (Array.isArray(objOrArrayOrValue)) {
    const newArray: JSONArray = objOrArrayOrValue
      .map((item) => removeEmptySubtrees(item))
      .filter((value) => value != null) as JSONArray
    if (newArray.length === 0) {
      return null
    }
    return newArray as T
  }
  if (
    typeof objOrArrayOrValue === 'object' &&
    /* null is also an object */
    objOrArrayOrValue !== null
  ) {
    const newEntries = Object.entries(objOrArrayOrValue)
      .map(([key, value]) => [key, removeEmptySubtrees(value)])
      .filter(([, value]) => value != null)

    if (newEntries.length === 0) {
      return null
    }
    return Object.fromEntries(newEntries) as T
  }
  return objOrArrayOrValue
}

export const getTaxFormXml = (data: TaxFormData, pretty = false) => {
  const jsonObj = {
    'E-form': {
      $: {
        xmlns: 'http://schemas.gov.sk/form/esmao.eforms.bratislava.obec_024/201501.2',
      },
      Meta: {
        ID: 'esmao.eforms.bratislava.obec_024',
        Name: 'Ohlásenie o vzniku, zániku alebo zmene daňovej povinnosti k dani z nehnuteľností',
        Gestor: 'ESMaO',
        RecipientId: 'ico://sk/00603481',
        Version: '201501.2',
        ZepRequired: false,
      },
      Body: {
        ...udajeODanovnikoviXml(data),
        ...oddiel2Xml(data),
        ...oddiel3JedenUcelXml(data),
        ...oddiel3ViacereUcelyXml(data),
        ...oddiel4Xml(data),
        ...oslobodenieXml(data),
        ...prilohyXml(data),
        DatumZadaniaPodania: formatXsDateTimeXml(new Date()),
        ZakladneVyhlasenie: {
          SpravnostUdajovText:
            'Všeobecné informácie o poskytnutí, spracovaní a ochrane osobných údajov nájdete na https://esluzby.bratislava.sk/page/ochrana-osobnych-udajov',
          SuhlasSoSpracovanimText:
            'Týmto dávam na základe slobodnej vôle súhlas na spracovanie mojich osobných údajov uvedených vo formulári tohto podania a získaných z môjho osobného dokladu za v zmysle Nariadenia európskeho parlamentu a rady EÚ 2016/679 o ochrane fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe takýchto údajov a zákona č. 18/2018 Z.z. o ochrane osobných údajov a o zmene a doplnení niektorých zákonov. Zároveň potvrdzujem dovŕšenie veku 16 rokov pre potreby spracovania osobných údajov. Osobné údaje poskytujem za účelom spracovania mojej žiadosti.',
          PoskytujemSuhlas: 'true',
          PoskytujemSuhlasText: 'Poskytujem súhlas na spracovanie osobných údajov',
          NeposkytujemSuhlas: 'false',
          NeposkytujemSuhlasText: 'Neposkytujem súhlas na spracovanie osobných údajov',
        },
        Dorucenie: {
          AdresatPodania: {
            AdresatPodania: 'Mesto',
          },
          Checkbox: {
            Notifikacia: 'true',
          },
          FormaOdoslaniaZiadosti: 'Elektronicky',
          FormaDoruceniaRozhodnutia: {
            TypSposobuDorucenia: 'Elektronická schránka',
          },
        },
      },
    },
  }

  const jsonObjWithoutLeafs = removeEmptySubtrees(jsonObj)

  // Convert JSON to XML
  const builder = new Builder({
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty },
  })
  return builder.buildObject(jsonObjWithoutLeafs)
}
