import { parse } from 'semver'

/**
 * Pinned semver versions, including prerelease/build metadata. Anything semver
 * accepts but normalises away is rejected, so a `v` prefix, a range, or a
 * partial version never passes as a pin.
 */
export function isExactVersion(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const parsed = parse(value)

  if (parsed === null) {
    return false
  }

  // `SemVer.version` drops the build metadata, so it is re-appended before the
  // round-trip comparison.
  const normalized =
    parsed.build.length > 0 ? `${parsed.version}+${parsed.build.join('.')}` : parsed.version

  return normalized === value
}
