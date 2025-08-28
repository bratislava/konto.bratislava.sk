import { DeliveryMethodCodec} from "../norisCodec";
import { DeliveryMethodEnum } from '@prisma/client'
import { DeliveryMethodNoris} from "../types/tax.types";

describe('DeliveryMethodCodec', () => {
  describe('`decode`', () => {
    it('should decode CITY_ACCOUNT correctly', () => {
      const result = DeliveryMethodCodec.decode(DeliveryMethodEnum.CITY_ACCOUNT)
      expect(result).toBe(DeliveryMethodNoris.CITY_ACCOUNT)
    })

    it('should decode EDESK correctly', () => {
      const result = DeliveryMethodCodec.decode(DeliveryMethodEnum.EDESK)
      expect(result).toBe(DeliveryMethodNoris.EDESK)
    })

    it('should decode POSTAL correctly', () => {
      const result = DeliveryMethodCodec.decode(DeliveryMethodEnum.POSTAL)
      expect(result).toBe(DeliveryMethodNoris.POSTAL)
    })

    it('should return POSTAL as default when value is null', () => {
      const result = DeliveryMethodCodec.decode(null)
      expect(result).toBe(DeliveryMethodNoris.POSTAL)
    })

    it('should return POSTAL as default when value is undefined', () => {
      const result = DeliveryMethodCodec.decode(undefined)
      expect(result).toBe(DeliveryMethodNoris.POSTAL)
    })
  })

  describe('`encode`', () => {
    it('should encode CITY_ACCOUNT correctly', () => {
      const result = DeliveryMethodCodec.encode(DeliveryMethodNoris.CITY_ACCOUNT)
      expect(result).toBe(DeliveryMethodEnum.CITY_ACCOUNT)
    })

    it('should encode EDESK correctly', () => {
      const result = DeliveryMethodCodec.encode(DeliveryMethodNoris.EDESK)
      expect(result).toBe(DeliveryMethodEnum.EDESK)
    })

    it('should encode POSTAL correctly', () => {
      const result = DeliveryMethodCodec.encode(DeliveryMethodNoris.POSTAL)
      expect(result).toBe(DeliveryMethodEnum.POSTAL)
    })
  })

  describe('bidirectional conversion', () => {
    it('should maintain consistency for CITY_ACCOUNT', () => {
      const original = DeliveryMethodEnum.CITY_ACCOUNT
      const encoded = DeliveryMethodCodec.decode(original)
      const decoded = DeliveryMethodCodec.encode(encoded)
      expect(decoded).toBe(original)
    })

    it('should maintain consistency for EDESK', () => {
      const original = DeliveryMethodEnum.EDESK
      const encoded = DeliveryMethodCodec.decode(original)
      const decoded = DeliveryMethodCodec.encode(encoded)
      expect(decoded).toBe(original)
    })

    it('should maintain consistency for POSTAL', () => {
      const original = DeliveryMethodEnum.POSTAL
      const encoded = DeliveryMethodCodec.decode(original)
      const decoded = DeliveryMethodCodec.encode(encoded)
      expect(decoded).toBe(original)
    })

    it('should handle null input and maintain consistency', () => {
      const encoded = DeliveryMethodCodec.decode(null)
      const decoded = DeliveryMethodCodec.encode(encoded)
      expect(encoded).toBe(DeliveryMethodNoris.POSTAL)
      expect(decoded).toBe(DeliveryMethodEnum.POSTAL)
    })
  })

  describe('enum values mapping', () => {
    it('should correctly map all DeliveryMethodEnum values', () => {
      const allEnumValues = Object.values(DeliveryMethodEnum)

      allEnumValues.forEach(enumValue => {
        const decoded = DeliveryMethodCodec.decode(enumValue)
        expect(Object.values(DeliveryMethodNoris)).toContain(decoded)
      })
    })

    it('should correctly reverse map all DeliveryMethodNoris values', () => {
      const allNorisValues = Object.values(DeliveryMethodNoris)

      allNorisValues.forEach(norisValue => {
        const encoded = DeliveryMethodCodec.encode(norisValue)
        expect(encoded).not.toBe(null)
        expect(Object.values(DeliveryMethodEnum)).toContain(encoded)
      })
    })
  })

  describe('edge cases', () => {
    it('should throw when decoding empty string', () => {
      expect(() => {
        DeliveryMethodCodec.decode('' as DeliveryMethodEnum)
      }).toThrow()
    })

    it('should throw when decoding numeric input', () => {
      expect(() => {
        DeliveryMethodCodec.decode(123 as unknown as DeliveryMethodEnum)
      }).toThrow()
    })

    it('should throw when decoding object input', () => {
      expect(() => {
        DeliveryMethodCodec.decode({} as DeliveryMethodEnum)
      }).toThrow()
    })

    it('should throw when decoding empty string', () => {
      expect(() => {
        DeliveryMethodCodec.encode('' as DeliveryMethodNoris)
      }).toThrow()
    })

    it('should throw when decoding numeric input', () => {
      expect(() => {
        DeliveryMethodCodec.encode(123 as unknown as DeliveryMethodNoris)
      }).toThrow()
    })

    it('should throw when decoding object input', () => {
      expect(() => {
        DeliveryMethodCodec.encode({} as DeliveryMethodNoris)
      }).toThrow()
    })
  })
})
