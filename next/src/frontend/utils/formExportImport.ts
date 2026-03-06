/**
 * File object is not serializable, this converts it to a serializable object to be passed to the server.
 *
 * https://stackoverflow.com/a/67542174
 */
export const createSerializableFile = (file: File) => {
  const replacer: string[] = []
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in file) {
    replacer.push(key)
  }
  const stringified = JSON.stringify(file, replacer)
  return JSON.parse(stringified) as File
}
