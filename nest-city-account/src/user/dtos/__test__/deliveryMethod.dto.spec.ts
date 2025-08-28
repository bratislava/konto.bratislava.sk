import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { DeliveryMethodEnum } from '@prisma/client'
import {
  DeliveryMethodDto,
  DeliveryMethodActiveAndLockedDto,
} from '../deliveryMethod.dto'

describe('DeliveryMethodDto', () => {
  describe('IsRequiredForCityAccount Decorator', () => {
    it('should pass validation when delivery method is CITY_ACCOUNT and date is provided', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: new Date('2025-12-01T00:00:00.000Z'),
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should fail validation when delivery method is CITY_ACCOUNT and date is null', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: null,
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('date')
      expect(errors[0].constraints?.isRequiredForCityAccount).toBe(
        'date is required when delivery method is CITY_ACCOUNT'
      )
    })

    it('should fail validation when delivery method is CITY_ACCOUNT and date is undefined', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: undefined,
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('date')
      expect(errors[0].constraints?.isRequiredForCityAccount).toBe(
        'date is required when delivery method is CITY_ACCOUNT'
      )
    })

    it('should fail validation when delivery method is CITY_ACCOUNT and date is empty string', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: '',
      })

      const errors = await validate(dto)
      // This will have two errors: one for @IsDate() and one for @IsRequiredForCityAccount()
      expect(errors).toHaveLength(1)
      const dateError = errors.find((error) => error.property === 'date')
      expect(dateError).toBeDefined()
      expect(dateError?.constraints?.isDate).toBe(
        'date must be a Date instance'
      )
    })

    it('should pass validation when delivery method is not CITY_ACCOUNT and date is null', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.POSTAL,
        date: null,
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should pass validation when delivery method is not CITY_ACCOUNT and date is undefined', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.EDESK,
        date: undefined,
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should pass validation when delivery method is not CITY_ACCOUNT and date is provided', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.POSTAL,
        date: new Date('2025-12-01T00:00:00.000Z'),
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })
  })

  describe('Basic Validation', () => {
    it('should fail validation when deliveryMethod is invalid', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: 'INVALID_METHOD',
        date: new Date(),
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('deliveryMethod')
      expect(errors[0].constraints?.isEnum).toBeDefined()
    })

    it('should fail validation when date is not a valid date', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.POSTAL,
        date: 'invalid-date',
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('date')
      expect(errors[0].constraints?.isDate).toBeDefined()
    })

    it('should pass validation with valid enum and optional date', async () => {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.POSTAL,
      })

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })
  })
})

describe('DeliveryMethodActiveAndLockedDto', () => {
  it('should pass validation with valid active and locked delivery methods', async () => {
    const dto = plainToInstance(DeliveryMethodActiveAndLockedDto, {
      active: {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: new Date('2025-12-01T00:00:00.000Z'),
      },
      locked: {
        deliveryMethod: DeliveryMethodEnum.POSTAL,
      },
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation when active delivery method violates CITY_ACCOUNT rule', async () => {
    const dto = plainToInstance(DeliveryMethodActiveAndLockedDto, {
      active: {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: null,
      },
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('active')
    expect(errors[0].children).toHaveLength(1)
    expect(errors[0].children?.[0].property).toBe('date')
    expect(errors[0].children?.[0].constraints?.isRequiredForCityAccount).toBe(
      'date is required when delivery method is CITY_ACCOUNT'
    )
  })

  it('should fail validation when locked delivery method violates CITY_ACCOUNT rule', async () => {
    const dto = plainToInstance(DeliveryMethodActiveAndLockedDto, {
      locked: {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: undefined,
      },
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('locked')
    expect(errors[0].children).toHaveLength(1)
    expect(errors[0].children?.[0].property).toBe('date')
    expect(errors[0].children?.[0].constraints?.isRequiredForCityAccount).toBe(
      'date is required when delivery method is CITY_ACCOUNT'
    )
  })

  it('should pass validation when both active and locked are undefined', async () => {
    const dto = plainToInstance(DeliveryMethodActiveAndLockedDto, {})

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should pass validation when only one field is provided', async () => {
    const dto = plainToInstance(DeliveryMethodActiveAndLockedDto, {
      active: {
        deliveryMethod: DeliveryMethodEnum.EDESK,
      },
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation when active is not an object', async () => {
    const dto = plainToInstance(DeliveryMethodActiveAndLockedDto, {
      active: 'invalid-object',
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('active')
    expect(errors[0].constraints?.isObject).toBeDefined()
  })
})

describe('Custom Decorator Edge Cases', () => {
  it('should handle different data types for date validation', async () => {
    const testCases = [
      { date: 0, shouldFail: false },
      { date: false, shouldFail: false },
      { date: [], shouldFail: true },
      { date: {}, shouldFail: true },
      { date: '2025-01-01', shouldFail: false },
      { date: '2025-99-99', shouldFail: true },
    ]

    for (const testCase of testCases) {
      const dto = plainToInstance(DeliveryMethodDto, {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: testCase.date,
      })

      const errors = await validate(dto)
      if (testCase.shouldFail) {
        expect(errors.length).toBeGreaterThan(0)
        const dateError = errors.find((error) => error.property === 'date')
        expect(dateError?.constraints?.isDate).toBe(
          'date must be a Date instance'
        )
      } else {
        expect(errors).toHaveLength(0)
      }
    }
  })

  it('should work correctly with string dates that get transformed', async () => {
    const dto = plainToInstance(DeliveryMethodDto, {
      deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
      date: '2025-12-01T00:00:00.000Z',
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
    expect(dto.date).toBeInstanceOf(Date)
  })
})