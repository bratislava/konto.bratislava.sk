type InputObject = Record<string, readonly string[]>

type CombinationType<T extends InputObject> = {
  [K in keyof T]: T[K][number]
}

export function createCombinations<T extends InputObject, R>(
  input: T,
  fn: (combination: CombinationType<T>) => R,
): R[] {
  const keys = Object.keys(input) as (keyof T)[]
  const values = keys.map((key) => input[key])

  function cartesianProduct<V>(arrays: V[][]): V[][] {
    return arrays.reduce<V[][]>(
      (results, current) =>
        results.map((result) => current.map((value) => [...result, value])).flat(),
      [[]],
    )
  }

  // @ts-expect-error
  const combinations = cartesianProduct(values)

  return combinations.map((combination) => {
    const obj = Object.fromEntries(
      keys.map((key, index) => [key, combination[index]]),
    ) as CombinationType<T>

    return fn(obj)
  })
}
