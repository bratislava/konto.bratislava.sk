// Pinned semver versions, including prerelease/build metadata.
const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

export function isExactVersion(value) {
  return typeof value === 'string' && exactVersionPattern.test(value)
}
