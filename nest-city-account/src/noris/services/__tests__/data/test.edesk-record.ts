import { EdeskRecord } from '../../../types/noris.types'

export const testEdeskRecord1: EdeskRecord = {
  id_noris: 1,
  uri_generated: 'rc://sk/0011225544_uri_test',
  uri_new: undefined,
}

export const testEdeskRecord2: EdeskRecord = {
  id_noris: 2,
  uri_generated: 'rc://sk/0011225544_uri_test',
  uri_new: undefined,
}

export const invalidEdeskRecordMissingIdNoris = {
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const invalidEdeskRecordMissingUriGenerated = {
  id_noris: 3,
}

export const invalidEdeskRecordWrongIdNorisType = {
  id_noris: '12345',
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const invalidEdeskRecordWrongUriGeneratedType = {
  id_noris: 4,
  uri_generated: 12345,
}

export const invalidEdeskRecordEmptyUri = {
  id_noris: 5,
  uri_generated: '',
}

export const invalidEdeskRecordWhitespaceOnlyUri = {
  id_noris: 6,
  uri_generated: '   \n\t  ',
}

export const invalidEdeskRecordControlCharUri = {
  id_noris: 7,
  uri_generated: 'rc://sk/0011225544\x00_uri_test',
}

export const edeskRecordWithWhitespaceUri = {
  id_noris: 8,
  uri_generated: 'rc://sk/0011225544 _uri_test',
}

export const edeskRecordWithNewlineUri = {
  id_noris: 9,
  uri_generated: 'rc://sk/0011225544\n_uri_test',
}

export const edeskRecordWithTabUri = {
  id_noris: 10,
  uri_generated: 'rc://sk/0011225544\t_uri_test',
}

export const validEdeskRecords: EdeskRecord[] = [testEdeskRecord1, testEdeskRecord2]

export const invalidEdeskRecords = [
  invalidEdeskRecordMissingIdNoris,
  invalidEdeskRecordMissingUriGenerated,
  invalidEdeskRecordWrongIdNorisType,
  invalidEdeskRecordWrongUriGeneratedType,
  invalidEdeskRecordEmptyUri,
  invalidEdeskRecordWhitespaceOnlyUri,
  invalidEdeskRecordControlCharUri,
]

export const allEdeskRecords = [...validEdeskRecords, ...invalidEdeskRecords]
