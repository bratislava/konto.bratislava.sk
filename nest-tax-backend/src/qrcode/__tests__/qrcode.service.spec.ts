/**
 * Pins the exact PAY by square output of the `bysquare` package for the way
 * `QrCodeService` uses it.
 *
 * `bysquare` is a single-maintainer, community implementation of the Slovak
 * Banking Association PAY by square standard (there is no official open-source
 * library). Its output ends up in the QR codes tax payers scan in their banking
 * apps, so an upgrade (or a compromised release) that silently changes the
 * encoding would mean wrong or unreadable payment data, which we wouldn't notice
 * from types or other tests.
 *
 * If these snapshots change after a `bysquare` upgrade, do not just update
 * them: check that the new QR codes scan correctly (amount, IBAN, variable
 * symbol, note, beneficiary) in a few Slovak banking apps first.
 */
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { parse, PaymentOptions } from 'bysquare'
import * as qrCode from 'qrcode'

import BaConfigService from '../../config/ba-config.service'
import { QrCodeGeneratorDto, QrPaymentNoteEnum } from '../dtos/qrcode.dto'
import { QrCodeService } from '../qrcode.service'

// invoiceId is a random UUID, fix it so the output is deterministic
vi.mock('node:crypto', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:crypto')>()),
  randomUUID: () => '00000000-0000-4000-8000-000000000000',
}))

// Wrap the real `toBuffer` so we can read the bysquare string it receives
vi.mock('qrcode', async (importOriginal) => {
  const actual = await importOriginal<typeof import('qrcode')>()
  return {
    ...actual,
    toBuffer: vi.fn(async (text: string) => actual.toBuffer(text)),
  }
})

describe('QrCodeService', () => {
  let service: QrCodeService

  beforeEach(async () => {
    vi.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeService,
        {
          provide: BaConfigService,
          useValue: createMock<BaConfigService>({
            payment: {
              beneficiaryName: 'Hlavné mesto Slovenskej republiky Bratislava',
            },
          }),
        },
      ],
    }).compile()

    service = module.get<QrCodeService>(QrCodeService)
  })

  const generateBySquare = async (dto: QrCodeGeneratorDto) => {
    const result = await service.createQrCode(dto)
    // The service returns a base64 PNG of the QR code
    expect(Buffer.from(result, 'base64').subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
    expect(qrCode.toBuffer).toHaveBeenCalledTimes(1)
    return vi.mocked(qrCode.toBuffer).mock.calls[0][0] as string
  }

  it('encodes a payment with a payment note', async () => {
    const bySquare = await generateBySquare({
      amount: 12_345,
      variableSymbol: '2026000123',
      paymentNote: QrPaymentNoteEnum.QR_oneTimePay,
      iban: 'SK3112000000198742637541',
    })

    expect(bySquare).toMatchInlineSnapshot(
      `"000AM0003GC7S2V3GP8S4KFF4NT01VR0GPQ73MAF43VJ78L421UL5L20OEBBCDN2U5I22DNGKE0HA8IA90RJCKMD6K60C5INC4OJKB9O6751V3L3PA6A25HGR4DE6QNJ9SND84UBQCM5BBFKVAJ2ULI7RVNDKT19QL6IOQQBVDVBFF9D72S279NBLGQ2287INHV6AQAUGV9H76PKSKJJJ8TR93VVA24D00"`,
    )
    expect(parse(bySquare)).toEqual({
      invoiceId: '00000000-0000-4000-8000-000000000000',
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: 123.45,
          bankAccounts: [{ iban: 'SK3112000000198742637541' }],
          beneficiary: { name: 'Hlavne mesto Slovenskej republiky Bratislava' },
          currencyCode: 'EUR',
          paymentNote: 'QR_jednorazova_uhrada',
          variableSymbol: '2026000123',
        },
      ],
    })
  })

  it('encodes a payment without a payment note', async () => {
    const bySquare = await generateBySquare({
      amount: 10,
      variableSymbol: '2026000456',
      iban: 'SK3112000000198742637541',
    })

    expect(bySquare).toMatchInlineSnapshot(
      `"0009I0007OG9B101IBKGO0RN889SLP1SQIN4S0KKQ8KDDGO8M9UEQO5B4H3C90VBK3OVVBTBHM4LFNFEOA7ECC2V4E7BTK1A6HPLCN77UMDA1A86KAHLKDFPE4NENOSJFQJT50C34RQ09DSOG4AJDFTP94VMBEPT6RSC22G9F5C73MD1DTB7J7QJ60GIRRBHN6A7GUVVVRHVB00"`,
    )
    expect(parse(bySquare)).toEqual({
      invoiceId: '00000000-0000-4000-8000-000000000000',
      payments: [
        {
          type: PaymentOptions.PaymentOrder,
          amount: 0.1,
          bankAccounts: [{ iban: 'SK3112000000198742637541' }],
          beneficiary: { name: 'Hlavne mesto Slovenskej republiky Bratislava' },
          currencyCode: 'EUR',
          paymentNote: 'QR_WEB',
          variableSymbol: '2026000456',
        },
      ],
    })
  })
})
