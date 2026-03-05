import { EdeskRecord } from '../../../types/noris.types'

export const testEdeskRecord1: EdeskRecord = {
  id_noris: 1,
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const testEdeskRecord2: EdeskRecord = {
  id_noris: 2,
  uri_generated: 'rc://sk/0011225544_uri_test',
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

export const validEdeskRecords: EdeskRecord[] = [
  testEdeskRecord1,
  testEdeskRecord2,
]

export const invalidEdeskRecords = [
  invalidEdeskRecordMissingIdNoris,
  invalidEdeskRecordMissingUriGenerated,
  invalidEdeskRecordWrongIdNorisType,
  invalidEdeskRecordWrongUriGeneratedType,
]

export const allEdeskRecords = [...validEdeskRecords, ...invalidEdeskRecords]
