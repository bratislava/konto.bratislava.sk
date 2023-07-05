const fs = require('fs').promises

// Replaces all `options?: any` with `options?: AxiosRequestConfig`.
// Needed until https://github.com/OpenAPITools/openapi-generator/issues/15985 is fixed
async function replaceOptionsType() {
  try {
    const data = await fs.readFile('clients/openapi-forms/api.ts', 'utf-8')
    const result = data.replace(/options\?: any/g, 'options?: AxiosRequestConfig')
    await fs.writeFile('clients/openapi-forms/api.ts', result, 'utf-8')
  } catch (err) {
    console.error(err)
  }
}

replaceOptionsType()
