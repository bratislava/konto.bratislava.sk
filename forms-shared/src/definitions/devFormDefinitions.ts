import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import { defaultColumnMapNajomneByvanie, defaultColumnMapNajomneByvanieDieta, getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka } from '../sharepoint/ziadost-o-pridelenie-najomneho-bytu'
import ziadostOPridelenieNajomnehoBytu from '../schemas/ziadostOPridelenieNajomnehoBytu'
import mimoriadnyOdvozALikvidaciaOdpadu from '../schemas/olo/mimoriadnyOdvozALikvidaciaOdpadu'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slovenskoSkUrl: '',
    slug: 'ziadost-o-pridelenie-najomneho-bytu',
    title: 'Žiadosť o pridelenie nájomného bytu',
    schemas: ziadostOPridelenieNajomnehoBytu,
    pospID: '',
    pospVersion: '',
    gestor: 'Martin Pinter',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    messageSubjectFormat: '',
    ginisAssignment: {
      ginisOrganizationName: '',
      ginisPersonName: '',
    },
    isSigned: false,
    sharepointData: {
      databaseName: 'dtb_NajomneByvanieTest',
      columnMap: defaultColumnMapNajomneByvanie,
      oneToMany: {
        'deti.zoznamDeti': {
          databaseName: 'dtb_NajomneByvanieDieta',
          originalTableId: 'Ziadatel',
          columnMap: defaultColumnMapNajomneByvanieDieta,
        }
      },
      oneToOne: [
        {
          databaseName: 'dtb_NajomneByvanieManzelTest',
          originalTableId: 'ManzelManzelka',
          columnMap: getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka('manzelManzelka')
        },
        {
          databaseName: 'dtb_NajomneByvanieDruh',
          originalTableId: 'DruhDruzka',
          columnMap: getDefaultColumnMapNajomneByvanieDruhDruzkaManzelManzelka('druhDruzka')
        }
      ]
    }
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-mimoriadny-odvoz-a-likvidacia-odpadu',
    title: 'Mimoriadny odvoz a likvidácia odpadu',
    schemas: mimoriadnyOdvozALikvidaciaOdpadu,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
]
