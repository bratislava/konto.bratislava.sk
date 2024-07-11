import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import ziadostNajomne from '../schemas/ziadostOPridelenieNajomnehoBytu'
import { defaultColumnMapNajomneByvanie, defaultColumnMapNajomneByvanieDieta, replacePrefixInInfo } from '../sharepoint/ziadost-o-pridelenie-najomneho-bytu'

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
      tableName: 'SP.Data.Dtb_x005f_NajomneByvanieTestListItem',
      columnMap: defaultColumnMapNajomneByvanie,
      oneToMany: {
        'deti.zoznamDeti': {
          databaseName: 'dtb_NajomneByvanieDieta',
          tableName: 'SP.Data.Dtb_x005f_NajomneByvanieDietaListItem',
          originalTableId: 'ZiadatelID',
          columnMap: defaultColumnMapNajomneByvanieDieta,
        }
      },
      oneToOne: [
        {
          databaseName: 'dtb_NajomneByvanieManzelTest',
          tableName: 'SP.Data.Dtb_x005f_NajomneByvanieManzelTestListItem',
          originalTableId: 'ManzelManzelka',
          columnMap: replacePrefixInInfo(defaultColumnMapNajomneByvanie, 'ziadatelZiadatelka', 'manzelManzelka')
        },
        {
          databaseName: 'dtb_NajomneByvanieDruh',
          tableName: 'SP.Data.Dtb_x005f_NajomneByvanieDruhListItem',
          originalTableId: 'DruhDruzka',
          columnMap: replacePrefixInInfo(defaultColumnMapNajomneByvanie, 'ziadatelZiadatelka', 'druhDruzka')
        }
      ]
    }
  },
]
