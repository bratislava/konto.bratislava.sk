import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import ziadostNajomne from '../schemas/ziadostOPridelenieNajomnehoBytu'
import { defaultColumnMapNajomneByvanie, replacePrefixInInfo } from '../sharepoint/ziadost-o-pridelenie-najomneho-bytu'

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
      databaseName: 'najomne-byvanie-test',
      tableName: 'najomne-byvanie-test',
      columnMap: defaultColumnMapNajomneByvanie,
      oneToMany: {
        'deti.zoznamDeti': {
          databaseName: 'TODO',
          tableName: 'TODO',
          originalTableId: 'TODO - ZiadatelId?',
          columnMap: {} // TODO
        }
      },
      oneToOne: [
        {
          databaseName: 'TODO',
          tableName: 'TODO',
          originalTableId: 'ManzelManzelka',
          columnMap: replacePrefixInInfo(defaultColumnMapNajomneByvanie, 'ziadatelZiadatelka', 'manzelManzelka')
        },
        {
          databaseName: 'TODO',
          tableName: 'TODO',
          originalTableId: 'DruhDruzka',
          columnMap: replacePrefixInInfo(defaultColumnMapNajomneByvanie, 'ziadatelZiadatelka', 'druhDruzka')
        }
      ]
    }
  },
]
