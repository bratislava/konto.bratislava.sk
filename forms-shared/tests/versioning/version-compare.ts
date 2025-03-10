import { describe, it, expect } from 'vitest'
import {
  compareVersions,
  VersionCompareResult,
  isValidVersion,
} from '../../src/versioning/version-compare'

describe('version comparison', () => {
  describe('version validation', () => {
    const validVersions = ['1.0.0', '2.1.3', '10.20.30']
    const invalidVersions = [
      '1.0', // missing patch
      '1', // missing minor and patch
      '1.0.0.0', // extra segment
      'a.b.c', // non-numeric
      'x.y.z', // non-numeric
      '1.0.x', // partial non-numeric
      '1.0.0-alpha', // pre-release not supported
      '1.0.0+build', // build metadata not supported
      '', // empty string
    ]

    it.each(validVersions)('should accept valid version %s', (version) => {
      expect(isValidVersion(version)).toBe(true)
    })

    it.each(invalidVersions)('should reject invalid version %s', (version) => {
      expect(isValidVersion(version)).toBe(false)
    })
  })

  describe('version comparison', () => {
    it('should return Same for identical versions', () => {
      expect(compareVersions({ currentVersion: '1.0.0', latestVersion: '1.0.0' })).toBe(
        VersionCompareResult.Same,
      )
      expect(compareVersions({ currentVersion: '2.1.3', latestVersion: '2.1.3' })).toBe(
        VersionCompareResult.Same,
      )
    })

    it('should return Patch for patch version differences', () => {
      expect(compareVersions({ currentVersion: '1.0.0', latestVersion: '1.0.1' })).toBe(
        VersionCompareResult.Patch,
      )
      expect(compareVersions({ currentVersion: '2.1.3', latestVersion: '2.1.4' })).toBe(
        VersionCompareResult.Patch,
      )
    })

    it('should return Minor for minor version differences', () => {
      expect(compareVersions({ currentVersion: '1.0.0', latestVersion: '1.1.0' })).toBe(
        VersionCompareResult.Minor,
      )
      expect(compareVersions({ currentVersion: '2.1.3', latestVersion: '2.2.0' })).toBe(
        VersionCompareResult.Minor,
      )
    })

    it('should return Major for major version differences', () => {
      expect(compareVersions({ currentVersion: '1.0.0', latestVersion: '2.0.0' })).toBe(
        VersionCompareResult.Major,
      )
      expect(compareVersions({ currentVersion: '2.1.3', latestVersion: '3.0.0' })).toBe(
        VersionCompareResult.Major,
      )
    })

    it('should return Invalid when current version is greater than latest', () => {
      expect(compareVersions({ currentVersion: '1.0.1', latestVersion: '1.0.0' })).toBe(
        VersionCompareResult.Invalid,
      )
      expect(compareVersions({ currentVersion: '2.0.0', latestVersion: '1.9.9' })).toBe(
        VersionCompareResult.Invalid,
      )
    })
  })
})
