/* eslint-disable no-useless-escape */
/* eslint-disable no-secrets/no-secrets */
/* eslint-disable pii/no-email */

import { FormError } from '@prisma/client'

/* eslint-disable pii/no-phone-number */
export const RABBIT_MQ = {
  EXCHANGE: 'nest-forms-backend',
  ROUTING_KEY: 'send_form',
  QUEUE: 'send_form',
}

export const RABBIT_NASES = {
  ROUTING_KEY: 'nases_check_delivery',
  QUEUE: 'nases_check_delivery',
}

export const RABBIT_GINIS_AUTOMATION = {
  EXCHANGE: 'ginis-automation',
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10

export const MAX_TRIES_FOR_NASES_CHECK = 10

export const INNOVATION_MAIl = 'inovacie@bratislava.sk'

export const EDITABLE_ERRORS: Array<FormError> = [FormError.INFECTED_FILES]

export const JSON_FORM_EXAMPLE = {
  mestoPSCstep: {
    mestoPSC: {
      mesto: 'Košice',
      psc: '12345',
    },
  },
  dateTimePickerShowcase: {
    dateTimePicker: {
      dateValue: '2023-07-20',
      timeValue: '00:00',
    },
  },
  inputFields: {
    firstName: 'Anton',
    lastName: 'Peluha',
    textAreas: {
      pros: '123123',
      cons: 'Defaultna hodnota',
    },
  },
  checkBoxes: {
    favouriteFruits: ['orange', 'banana', 'grape'],
  },
  chooseOneOf: {
    chooseOneOfMore: 'screen',
    chooseOneOfTwo: 'Ano',
  },
  fileUploads: {
    importButtonMultipleFiles: ['d232e2b3-3701-4046-80f9-012e7566aef3'],
    importDragAndDropMultipleFiles: [],
  },
  selectFields: {
    school: 'stu_fei',
    diplomas: [],
  },
  dateFromToShowcase: {
    dateFromTo: {
      startDate: '2023-07-13',
      endDate: '2023-07-27',
    },
  },
  timeFromToShowcase: {
    timeFromTo: {
      endTime: '00:00',
    },
  },
}
export const XML_FORM_EXAMPLE =
  '<?xml version="1.0" encoding="utf-8"?>\n<E-form xmlns="http://schemas.gov.sk/doc/eform/form/0.1" xsi:schemaLocation="http://schemas.gov.sk/doc/eform/form/0.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <Meta>\n    <ID>00603481.dopravneZnacenie.sk</ID>\n    <Name>Dopravné značenie</Name>\n    <Gestor/>\n    <RecipientId/>\n    <Version>0.2</Version>\n    <ZepRequired>false</ZepRequired>\n    <EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid>\n    <SenderID>mailto:hruska@example.com</SenderID>\n  </Meta>\n<Body><MestoPSCstep><MestoPSC><Mesto>Košice</Mesto><Psc>12345</Psc></MestoPSC></MestoPSCstep><DateTimePickerShowcase><DateTimePicker><DateValue>2023-07-20</DateValue><TimeValue>00:00</TimeValue></DateTimePicker></DateTimePickerShowcase><TimeFromToShowcase><TimeFromTo><EndTime>00:00</EndTime></TimeFromTo></TimeFromToShowcase><DateFromToShowcase><DateFromTo><StartDate>2023-07-13</StartDate><EndDate>2023-07-27</EndDate></DateFromTo></DateFromToShowcase><InputFields><FirstName>Anton</FirstName><LastName>Peluha</LastName><TextAreas><Pros>123123</Pros><Cons>Defaultna hodnota</Cons></TextAreas></InputFields><SelectFields><School>stu_fei</School></SelectFields><FileUploads><ImportButtonMultipleFiles><Nazov>d232e2b3-3701-4046-80f9-012e7566aef3</Nazov><Prilozena>true</Prilozena></ImportButtonMultipleFiles></FileUploads><ChooseOneOf><ChooseOneOfMore>screen</ChooseOneOfMore><ChooseOneOfTwo>Ano</ChooseOneOfTwo></ChooseOneOf><CheckBoxes><FavouriteFruits>orange</FavouriteFruits><FavouriteFruits>banana</FavouriteFruits><FavouriteFruits>grape</FavouriteFruits></CheckBoxes></Body></E-form>'

/* eslint-enable no-secrets/no-secrets */
/* eslint-enable pii/no-email */
/* eslint-enable pii/no-phone-number */
/* eslint-enable no-useless-escape */
