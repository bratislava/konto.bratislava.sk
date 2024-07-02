type JSONPrimitive = string | number | boolean | null | undefined
type JSONArray = Array<JSONValue>
type JSONObject = { [key: string]: JSONValue }
type JSONValue = JSONPrimitive | JSONArray | JSONObject

/**
 * Recursively removes all subtrees from a JSON object or array that do not contain a primitive value.
 * Objects or arrays that end up empty after this pruning process are also removed.
 *
 * This function is particularly useful when dealing with JSON data intended for XML conversion,
 * as `undefined` values in JSON can lead to invalid XML. The function ensures that only nodes
 * with actual values are retained, thereby preventing the generation of invalid XML elements.
 *
 * @example
 * Consider the JSON object:
 * ```json
 * {
 *   "WithValue": {
 *     "Key": "Value"
 *   },
 *   "WithoutValue": [
 *     {
 *       "WithoutValueKey": {}
 *     },
 *     []
 *   ]
 * }
 * ```
 * After processing with this function, the `WithoutValue` subtree, which contains an empty object
 * and an empty array, would be removed, resulting in:
 * ```json
 * {
 *   "WithValue": {
 *     "Key": "Value"
 *   }
 * }
 * ```
 */
export const removeEmptySubtrees = <T extends JSONValue>(objOrArrayOrValue: T): T | null => {
  if (Array.isArray(objOrArrayOrValue)) {
    const newArray: JSONArray = objOrArrayOrValue
      .map((item) => removeEmptySubtrees(item))
      .filter((value) => value != null) as JSONArray
    if (newArray.length === 0) {
      return null
    }
    return newArray as T
  }
  if (
    typeof objOrArrayOrValue === 'object' &&
    /* null is also an object */
    objOrArrayOrValue !== null
  ) {
    const newEntries = Object.entries(objOrArrayOrValue)
      .map(([key, value]) => [key, removeEmptySubtrees(value)])
      .filter(([, value]) => value != null)

    if (newEntries.length === 0) {
      return null
    }
    return Object.fromEntries(newEntries) as T
  }
  return objOrArrayOrValue
}
