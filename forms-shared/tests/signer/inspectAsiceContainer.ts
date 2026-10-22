import fs from 'node:fs'
import path from 'node:path'

import { strToU8, zipSync, type Zippable } from 'fflate'
import { describe, expect, test } from 'vitest'

import {
  ASICE_MIMETYPE,
  inspectAsiceContainer,
  InspectAsiceContainerError,
  InspectAsiceContainerErrorType,
} from '../../src/signer/inspectAsiceContainer'

const FIXTURE_DIR = path.join(__dirname, 'test-container')
const DATA_FILE = 'signed_form_Test.xdcf'
const SIGNATURE_FILE = 'META-INF/signatures.xml'
const MANIFEST_FILE = 'META-INF/manifest.xml'

type Files = Record<string, Uint8Array>

/** Unpacked, redacted container in `test-container/`, read as zip entries. */
const readFixture = (): Files => {
  const files: Files = {}
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else {
        files[path.relative(FIXTURE_DIR, fullPath).replaceAll('\\', '/')] =
          fs.readFileSync(fullPath)
      }
    }
  }
  walk(FIXTURE_DIR)

  // The checked-out file may have a trailing (CR)LF, a real container has none.
  files.mimetype = strToU8(ASICE_MIMETYPE)
  return files
}

/** Builds a base64 container the way D.Signer does: `mimetype` first and stored uncompressed. */
const toBase64 = (files: Files) => {
  const { mimetype, ...rest } = files
  const zippable: Zippable = mimetype ? { mimetype: [mimetype, { level: 0 }], ...rest } : rest
  return Buffer.from(zipSync(zippable)).toString('base64')
}

const without = (files: Files, ...names: string[]) =>
  Object.fromEntries(Object.entries(files).filter(([name]) => !names.includes(name)))

const expectError = (base64: string, type: InspectAsiceContainerErrorType) => {
  expect(() => inspectAsiceContainer(base64)).toThrow(new InspectAsiceContainerError(type))
}

describe('inspectAsiceContainer', () => {
  describe('accepts', () => {
    test('container in the shape produced by D.Signer', () => {
      const result = inspectAsiceContainer(toBase64(readFixture()))

      expect(result.dataFileName).toBe(DATA_FILE)
      expect(result.signatureFileName).toBe(SIGNATURE_FILE)
      expect(result.dataXml).toContain('<xdc:XMLDataContainer')
    })

    test('signature file named signatures001.xml (used by some D.Signer installations)', () => {
      const files = readFixture()
      const result = inspectAsiceContainer(
        toBase64({
          ...without(files, SIGNATURE_FILE),
          'META-INF/signatures001.xml': files[SIGNATURE_FILE],
        }),
      )

      expect(result.signatureFileName).toBe('META-INF/signatures001.xml')
    })

    test('container without manifest', () => {
      expect(() =>
        inspectAsiceContainer(toBase64(without(readFixture(), MANIFEST_FILE))),
      ).not.toThrow()
    })

    test('data file without extension (older signer data)', () => {
      const files = readFixture()
      const result = inspectAsiceContainer(
        toBase64({ ...without(files, DATA_FILE), signed_form: files[DATA_FILE] }),
      )

      expect(result.dataFileName).toBe('signed_form')
    })

    test('directory entries', () => {
      const files = readFixture()
      const zippable: Zippable = {
        mimetype: [files.mimetype, { level: 0 }],
        'META-INF': {
          'manifest.xml': files[MANIFEST_FILE],
          'signatures.xml': files[SIGNATURE_FILE],
        },
        [DATA_FILE]: files[DATA_FILE],
      }

      expect(() =>
        inspectAsiceContainer(Buffer.from(zipSync(zippable)).toString('base64')),
      ).not.toThrow()
    })
  })

  describe('rejects', () => {
    test.each([
      ['plain text', Buffer.from('Toto nie je podpísaný dokument.').toString('base64')],
      ['empty string', ''],
      [
        'random bytes',
        Buffer.from(Array.from({ length: 512 }, (_, i) => (i * 37) % 256)).toString('base64'),
      ],
      ['container cut in half', toBase64(readFixture()).slice(0, 400)],
    ])('%s as not a zip', (_name, base64) => {
      expectError(base64, InspectAsiceContainerErrorType.NotZip)
    })

    test('more entries than any signature container has', () => {
      const files = readFixture()
      const extra = Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [`META-INF/extra${i}.txt`, strToU8('x')]),
      )

      expectError(toBase64({ ...files, ...extra }), InspectAsiceContainerErrorType.TooLarge)
    })

    test('uncompressed size over the limit', () => {
      const files = readFixture()

      expectError(
        toBase64({ ...files, 'META-INF/big.bin': new Uint8Array(21 * 1024 * 1024) }),
        InspectAsiceContainerErrorType.TooLarge,
      )
    })

    test.each([
      ['empty zip', {}],
      ['zip with a text file', { 'readme.txt': strToU8('ahoj') }],
      [
        'valid container nested inside a plain zip',
        { 'podpis.asice': Buffer.from(toBase64(readFixture()), 'base64') },
      ],
    ])('%s as wrong mimetype', (_name, files: Files) => {
      expectError(toBase64(files), InspectAsiceContainerErrorType.WrongMimetype)
    })

    test.each([
      ['missing', (files: Files) => without(files, 'mimetype')],
      ['different', (files: Files) => ({ ...files, mimetype: strToU8('application/zip') })],
      [
        'with trailing newline',
        (files: Files) => ({ ...files, mimetype: strToU8(`${ASICE_MIMETYPE}\n`) }),
      ],
    ])('mimetype %s', (_name, modify) => {
      expectError(toBase64(modify(readFixture())), InspectAsiceContainerErrorType.WrongMimetype)
    })

    test('unexpected file in META-INF', () => {
      expectError(
        toBase64({ ...readFixture(), 'META-INF/extra.txt': strToU8('x') }),
        InspectAsiceContainerErrorType.UnexpectedMetaInfEntry,
      )
    })

    test('container without signature', () => {
      expectError(
        toBase64(without(readFixture(), SIGNATURE_FILE)),
        InspectAsiceContainerErrorType.MissingSignature,
      )
    })

    test('two signature files', () => {
      const files = readFixture()

      expectError(
        toBase64({ ...files, 'META-INF/signatures002.xml': files[SIGNATURE_FILE] }),
        InspectAsiceContainerErrorType.MultipleSignatures,
      )
    })

    test.each([
      ['extra unsigned PDF', (files: Files) => ({ ...files, 'extra.pdf': strToU8('%PDF-1.4') })],
      [
        'extra file in a subdirectory',
        (files: Files) => ({ ...files, 'Attachments/extra.txt': strToU8('x') }),
      ],
      ['no data file', (files: Files) => without(files, DATA_FILE)],
    ])('%s', (_name, modify) => {
      expectError(
        toBase64(modify(readFixture())),
        InspectAsiceContainerErrorType.UnexpectedDataFiles,
      )
    })
  })
})
