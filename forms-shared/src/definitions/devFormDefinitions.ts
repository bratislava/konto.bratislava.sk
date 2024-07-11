import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import ziadostNajomne from '../schemas/ziadostOPridelenieNajomnehoBytu'
import { defaultColumnMapNajomneByvanie, defaultColumnMapNajomneByvanieDieta, defaultColumnMapNajomneByvanieDruhDruzka, defaultColumnMapNajomneByvanieManzelManzelka } from '../sharepoint/ziadost-o-pridelenie-najomneho-bytu'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slovenskoSkUrl: '',
    slug: 'ziadost-o-pridelenie-najomneho-bytu',
    title: 'Žiadosť o pridelenie nájomného bytu',
    schemas: ziadostNajomne,
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
          originalTableId: 'ZiadatelID',
          columnMap: defaultColumnMapNajomneByvanieDieta,
        }
      },
      oneToOne: [
        {
          databaseName: 'dtb_NajomneByvanieManzelTest',
          originalTableId: 'ManzelManzelka',
          columnMap: defaultColumnMapNajomneByvanieManzelManzelka
        },
        {
          databaseName: 'dtb_NajomneByvanieDruh',
          originalTableId: 'DruhDruzka',
          columnMap: defaultColumnMapNajomneByvanieDruhDruzka
        }
      ]
    }
  },
]
