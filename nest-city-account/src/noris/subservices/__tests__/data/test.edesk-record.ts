import { EdeskRecord } from '../../../types/noris.types'

export const testEdeskRecord1: EdeskRecord = {
  id_noris: 'noris-001',
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const testEdeskRecord2: EdeskRecord = {
  id_noris: 'noris-002',
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const invalidEdeskRecordMissingIdNoris = {
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const invalidEdeskRecordMissingUriGenerated = {
  id_noris: 'noris-003',
}

export const invalidEdeskRecordWrongIdNorisType = {
  id_noris: 12345,
  uri_generated: 'rc://sk/0011225544_uri_test',
}

export const invalidEdeskRecordWrongUriGeneratedType = {
  id_noris: 'noris-004',
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
