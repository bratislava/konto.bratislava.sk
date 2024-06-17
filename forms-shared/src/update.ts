import 'dotenv/config'
import prompts from 'prompts'
import { execSync } from 'child_process'
// import { FormData } from 'formdata-node'
import { readFile } from 'fs/promises'
import fs from 'fs'
// import { FormDataEncoder } from 'form-data-encoder'
import semver from 'semver'
import chalk from 'chalk'
import { rimrafSync } from 'rimraf'

// Load tokens from .env
const devToken = process.env.DEV_TOKEN
const stagingToken = process.env.STAGING_TOKEN
const prodToken = process.env.PROD_TOKEN

// Print warning if any token is not present
if (!devToken) {
  console.warn(
    'Warning: DEV_TOKEN is not present in .env file. Uploading to this environment will not work.',
  )
}
if (!stagingToken) {
  console.warn(
    'Warning: STAGING_TOKEN is not present in .env file. Uploading to this environment will not work.',
  )
}
if (!prodToken) {
  console.warn(
    'Warning: PROD_TOKEN is not present in .env file. Uploading to this environment will not work.',
  )
}

const handleOnStateAborter = (state: any) => {
  if (state.aborted) {
    process.nextTick(() => {
      process.exit(0)
    })
  }
}

// rest of the logic in async block as prompts works with promises
;(async () => {
  console.log(chalk.blueBright('Generate and update backend form schemas wizard 🧙‍♂️'))
  const environmentsWithTokens = {
    'https://nest-forms-backend.staging.bratislava.sk': stagingToken,
    'https://nest-forms-backend.bratislava.sk': prodToken,
    'https://nest-forms-backend.dev.bratislava.sk': devToken,
    'http://localhost:3000': devToken,
  }

  const environmentResponse = await prompts({
    onState: handleOnStateAborter,
    type: 'select',
    name: 'environment',
    message: 'Select the environment to which you want to publish',
    choices: Object.keys(environmentsWithTokens).map((key) => ({ title: key, value: key })),
  })

  const environment: keyof typeof environmentsWithTokens = environmentResponse.environment
  const token = environmentsWithTokens[environment]
  const isProduction = environment === 'https://nest-forms-backend.bratislava.sk'

  if (!token) throw new Error('Token not found for environment')

  const response = await prompts({
    onState: handleOnStateAborter,
    type: 'confirm',
    name: 'value',
    message: `Re-generate all schema files first ? The 'gestor' will be set according to environment selected in previous step.
${chalk.redBright('This will delete the entire dist directory!')}
${chalk.reset.italic(
  'This step requires that you have @bratislava/jsxt installed globally. If you need just schema.json and uiSchema.json for all forms without the xml transforms you may use ',
)}${chalk.reset('npm run generate:all')}
`,
  })
  if (response.value) {
    rimrafSync('./dist', {}) // Empty options object as second argument
    await execSync('npm run generate:all')
    const subdirs = fs.readdirSync('./dist')
    const gestor = isProduction ? 'Martin Pinter' : 'Tisici Janko'
    console.log(`Generating with gestor ${chalk.bold(gestor)}:`)
    for (const subdir of subdirs) {
      console.log(subdir)
      await execSync(`cd ./dist/${subdir} && jsxt pack -j schema.json --gestor="${gestor}"`)
    }
  } else {
    console.log('Note that if the schemas are not present in dist directory the script will fail.')
  }

  const files = fs.readdirSync('./dist')
  const choices = files.map((file) => ({ title: file, value: file }))
  const chosenSlugsResponse = await prompts({
    onState: handleOnStateAborter,
    type: 'multiselect',
    name: 'selectedSlugs',
    message: 'Select the schemas you want to use',
    choices: choices,
  })

  // each of the prompts needs an onState handler to exit on ctrl+c, otherwise it would be understood as empty answer
  const actionResponse = await prompts({
    onState: handleOnStateAborter,
    type: 'select',
    name: 'action',
    message: 'Do you want to patch the existing schema version or upgrade to a new one?',
    choices: [
      { title: 'Patch existing', value: 'PATCH' },
      { title: 'Upgrade to new', value: 'POST' },
    ],
  })

  for (const slug of chosenSlugsResponse.selectedSlugs) {
    const schemaVersionsUrl = `${environment}/schemas/schema-versions?onlyLatest=true&slug=${slug}&currentPage=1&pagination=10`
    console.log(`Fetching from: ${schemaVersionsUrl}`)
    const schemaVersionsResponse = await fetch(schemaVersionsUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })

    console.log(
      `Response status: ${schemaVersionsResponse.status} ${schemaVersionsResponse.statusText}`,
    )

    const data: any = await schemaVersionsResponse.json()

    const firstItem = data?.items?.[0]

    if (!firstItem) {
      throw new Error(`No schema version found for slug ${slug}`)
    }

    const id = firstItem.id
    const version = firstItem.version
    const pospVersion = firstItem.pospVersion

    console.log(
      `Environment: ${
        isProduction ? chalk.redBright.bold(environment) : chalk.greenBright.bold(environment)
      }, PospVersion: ${chalk.bold(pospVersion)}, Version: ${chalk.bold(
        version,
      )}, Slug: ${chalk.bold(slug)}, latestSchemaVersionId: ${chalk.bold(id)}`,
    )

    if (actionResponse.action === 'POST') {
      const defaultNewVersion = semver.inc(version, 'patch') || version

      const versionResponse = await prompts({
        onState: handleOnStateAborter,
        type: 'text',
        name: 'version',
        message: 'Enter the new version:',
        initial: defaultNewVersion,
      })

      const newVersion = `v${versionResponse.version}`

      const pospVersionResponse = await prompts({
        onState: handleOnStateAborter,
        type: 'text',
        name: 'pospVersion',
        message: 'Enter the new pospVersion:',
        initial: pospVersion,
      })

      const newPospVersion = pospVersionResponse.pospVersion

      const url = `${environment}/admin/schema/upgrade/${slug}`

      const form = new FormData()
      // the endpoint requires at least some body or it will fail
      form.append(
        'data',
        JSON.stringify({
          version: newVersion,
          pospVersion: newPospVersion,
        }),
      )

      form.append('files', new Blob([await readFile(`./dist/${slug}/schema.json`)]), 'schema.json')
      form.append(
        'files',
        new Blob([await readFile(`./dist/${slug}/uiSchema.json`)]),
        'uiSchema.json',
      )
      form.append(
        'files',
        new Blob([await readFile(`./dist/${slug}/generated/data.json`)]),
        'data.json',
      )
      form.append(
        'files',
        new Blob([await readFile(`./dist/${slug}/generated/data.xml`)]),
        'data.xml',
      )
      form.append(
        'files',
        new Blob([await readFile(`./dist/${slug}/generated/form.fo.xslt`)]),
        'form.fo.xslt',
      )
      console.log('Uploading to: ', url)
      const response = await fetch(url, {
        method: 'POST',
        body: form,
        headers: {
          accept: '*/*',
          apiKey: token,
        },
      })
      console.log(`Response status: ${response.status} ${response.statusText}`)
      if (!response.ok) {
        console.log(
          chalk.redBright.bold(
            'Failed to update - if multiple forms were selected the program will continue to the next one. Response error text: ',
          ) + (await response.text()),
        )
      }
    } else {
      const confirm = await prompts({
        onState: handleOnStateAborter,
        type: 'confirm',
        name: 'value',
        message: `Does the above look right ?`,
      })
      if (confirm) {
        const url = `${environment}/admin/schema-version/${id}`
        const form = new FormData()
        // the endpoint requires at least some body or it will fail
        form.append('data', JSON.stringify({}))

        form.append(
          'files',
          new Blob([await readFile(`./dist/${slug}/schema.json`)]),
          'schema.json',
        )
        form.append(
          'files',
          new Blob([await readFile(`./dist/${slug}/uiSchema.json`)]),
          'uiSchema.json',
        )
        form.append(
          'files',
          new Blob([await readFile(`./dist/${slug}/generated/data.json`)]),
          'data.json',
        )
        form.append(
          'files',
          new Blob([await readFile(`./dist/${slug}/generated/data.xml`)]),
          'data.xml',
        )
        form.append(
          'files',
          new Blob([await readFile(`./dist/${slug}/generated/form.fo.xslt`)]),
          'form.fo.xslt',
        )
        form.append(
          'files',
          new Blob([await readFile(`./dist/${slug}/generated/xmlTemplate.xml`)]),
          'xmlTemplate.xml',
        )
        console.log('Uploading to: ', url)
        const response = await fetch(url, {
          method: 'PATCH',
          body: form,
          headers: {
            accept: '*/*',
            Apikey: token,
          },
        })
        console.log(`Response status: ${response.status} ${response.statusText}`)
        if (!response.ok) {
          console.log(
            chalk.redBright.bold(
              'Failed to update - if mutiple forms were selected the program will continue to the next one. Response error text: ',
            ) + (await response.text()),
          )
        }
      } else {
        console.log('skipping')
      }
    }
  }
  console.log(
    chalk.blueBright(
      'Done! 🎉 If your changes required updating pospVersion, remember to submit the .zip files in ./dist/form-name/generated/ to http://formulare.upvsfixnew.gov.sk/ (staging) and/or http://formulare.slovensko.sk/ (prod). TODO link to docs here.',
    ),
  )
})()
