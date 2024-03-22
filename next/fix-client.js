const { parseArgs } = require('util')
const fs = require('fs').promises

// Replaces all `options?: any` with `options?: AxiosRequestConfig`.
// Needed until https://github.com/OpenAPITools/openapi-generator/issues/15985 is fixed
async function replaceOptionsType(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    const result = data.replace(/options\?: any/g, 'options?: AxiosRequestConfig')
    await fs.writeFile(filePath, result, 'utf-8')
  } catch (err) {
    console.error(err)
  }
}

const targetFilePathMap = {
  forms: 'clients/openapi-forms/api.ts',
  tax: 'clients/openapi-tax/api.ts',
  'city-account': 'clients/openapi-city-account/api.ts',
}

;(async () => {
  const args = parseArgs({
    options: {
      target: {
        type: 'string',
      },
    },
  })

  const { target } = args.values
  const targetFilePath = targetFilePathMap[target]
  if (!targetFilePath) {
    throw new Error('Invalid target')
  }

  await replaceOptionsType(targetFilePath)
})()
