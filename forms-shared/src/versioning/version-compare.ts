import * as semver from 'semver'

export enum VersionCompareResult {
  Same = 'Same',
  Patch = 'Patch',
  Minor = 'Minor',
  Major = 'Major',
  Invalid = 'Invalid',
}

export interface VersionCompareParams {
  currentVersion: string
  latestVersion: string
}

/**
 * Validates if a version string matches our versioning scheme and can be parsed by semver
 */
export function isValidVersion(version: string): boolean {
  const versionRegex = /^\d+\.\d+\.\d+$/
  if (!versionRegex.test(version)) {
    return false
  }

  const parsed = semver.parse(version)
  return parsed !== null
}

/**
 * Wrapper around semver to fit our versioning scheme.
 *
 * - We only support numbers in the format X.Y.Z.
 * - Current version is always less than or equal to latest version.
 */
export function compareVersions({
  currentVersion,
  latestVersion,
}: VersionCompareParams): VersionCompareResult {
  if (!isValidVersion(currentVersion) || !isValidVersion(latestVersion)) {
    return VersionCompareResult.Invalid
  }

  if (semver.gt(currentVersion, latestVersion)) {
    return VersionCompareResult.Invalid
  }

  if (semver.eq(currentVersion, latestVersion)) {
    return VersionCompareResult.Same
  }

  const current = semver.parse(currentVersion)!
  const latest = semver.parse(latestVersion)!

  if (current.major !== latest.major) {
    return VersionCompareResult.Major
  }

  if (current.minor !== latest.minor) {
    return VersionCompareResult.Minor
  }

  return VersionCompareResult.Patch
}

export const versionCompareIsContinuable = (versions: VersionCompareParams) => {
  const result = compareVersions(versions)
  return (
    result === VersionCompareResult.Patch ||
    result === VersionCompareResult.Minor ||
    result === VersionCompareResult.Same
  )
}

export const versionCompareRequiresBumpToContinue = (versions: VersionCompareParams) => {
  const result = compareVersions(versions)
  return result === VersionCompareResult.Minor
}

export const versionCompareRequiresConfirmationImportXml = (versions: VersionCompareParams) => {
  const result = compareVersions(versions)
  return result === VersionCompareResult.Minor
}

export const versionCompareBumpDuringSend = (versions: VersionCompareParams) => {
  const result = compareVersions(versions)
  return result === VersionCompareResult.Patch
}

export const versionCompareCanSendForm = (versions: VersionCompareParams) => {
  const result = compareVersions(versions)
  return result === VersionCompareResult.Same || result === VersionCompareResult.Patch
}

export enum VersionCompareContinueAction {
  CannotContinue = 'CannotContinue',
  RequiresBump = 'RequiresBump',
  None = 'None',
}

export const versionCompareContinueAction = (versions: VersionCompareParams) => {
  if (!versionCompareIsContinuable(versions)) {
    return VersionCompareContinueAction.CannotContinue
  }

  if (versionCompareRequiresBumpToContinue(versions)) {
    return VersionCompareContinueAction.RequiresBump
  }

  return VersionCompareContinueAction.None
}
