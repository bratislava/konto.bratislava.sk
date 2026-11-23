import { BRATISLAVA_TIME_ZONE } from '../../../../utils/functions/temporal'
import { checkTaxDateInclusion } from '../tax.helper'

describe('checkTaxDateInclusion', () => {
  it.each([
    { position: 'within', currentTime: '2024-08-15', expected: true },
    { position: 'before', currentTime: '2024-08-09', expected: false },
    { position: 'after', currentTime: '2024-08-21', expected: false },
  ])(
    'should return $expected for shouldAddCurrentYear when current time is $position the date range',
    ({ currentTime, expected }) => {
      const mockCurrentTime =
        Temporal.PlainDate.from(currentTime).toZonedDateTime(
          BRATISLAVA_TIME_ZONE,
        )

      const result = checkTaxDateInclusion(mockCurrentTime, {
        from: { month: 8, day: 10 },
        to: { month: 8, day: 20 },
      })

      expect(result).toBe(expected)
    },
  )
})
