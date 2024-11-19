import { Bench } from 'tinybench'
import { getEvaluatedStepsSchemas, getEvaluatedStepsSchemasLegacy } from '../src/form-utils/steps'
import priznanieKDaniZNehnutelnosti from '../src/schemas/priznanieKDaniZNehnutelnosti'
import priznanieKDaniZNehnutelnostiExample1 from '../src/example-forms/examples/priznanieKDaniZNehnutelnostiExample1'

async function main() {
  const bench = new Bench({})

  bench
    .add('getEvaluatedStepsSchemas', () => {
      getEvaluatedStepsSchemas(
        priznanieKDaniZNehnutelnosti.schema,
        priznanieKDaniZNehnutelnostiExample1.formData,
      )
    })
    .add('getEvaluatedStepsSchemasLegacy', () => {
      getEvaluatedStepsSchemasLegacy(
        priznanieKDaniZNehnutelnosti.schema,
        priznanieKDaniZNehnutelnostiExample1.formData,
      )
    })

  // Run the benchmarks
  await bench.run()

  // Print results
  console.table(console.table(bench.table()))
}

main().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
