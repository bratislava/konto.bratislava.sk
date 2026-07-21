import { timingSafeStringEqual } from '../crypto'

/**
 * Timing-safe secret comparison (OWASP recommendation)
 * Prevents timing attacks on client secret validation
 */
describe('timingSafeStringEqual', () => {
  it('should return true for matching secrets', () => {
    expect(timingSafeStringEqual('secret-123', 'secret-123')).toBe(true)
  })
  it('should return false for same-length mismatch', () => {
    expect(timingSafeStringEqual('secret-aaa', 'secret-bbb')).toBe(false)
  })
  it('should return false for different-length mismatch', () => {
    expect(timingSafeStringEqual('short', 'much-longer')).toBe(false)
  })
  it('should return false for empty vs non-empty', () => {
    expect(timingSafeStringEqual('expected', '')).toBe(false)
  })
  it('should return false for both empty (fail closed)', () => {
    expect(timingSafeStringEqual('', '')).toBe(false)
  })
})
