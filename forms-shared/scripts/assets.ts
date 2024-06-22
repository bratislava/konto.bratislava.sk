import * as path from 'node:path'
import { promises as fs } from 'fs'
import { getInterCss } from '../src/summary-pdf/interCss'
import { getTailwindCss } from '../src/summary-pdf/tailwindCss'

const rootDir = path.join(__dirname, '..')

const assetsList = [
  {
    name: 'taxPdf',
    getBase64Content: async () =>
      fs.readFile(path.join(rootDir, './resources/Priznanie_komplet_tlacivo.pdf'), {
        encoding: 'base64',
      }),
  },
  {
    name: 'taxPdfFont',
    getBase64Content: async () =>
      fs.readFile(path.join(rootDir, './resources/LiberationSans.ttf'), {
        encoding: 'base64',
      }),
  },
  {
    name: 'summaryPdfCss',
    getStringContent: async () => {
      const [interCss, tailwindCss] = await Promise.all([getInterCss(), getTailwindCss()])
      return [interCss, tailwindCss].join('\n')
    },
  },
]

const getTemplate = (base64String: string) => {
  return `export default Buffer.from(${JSON.stringify(base64String)}, 'base64');\n`
}

const srcAssetsDir = path.join(rootDir, './src/assets')

export const getAssets = async () => {
  return assetsList.map(async ({ name, getBase64Content, getStringContent }) => {
    const getContent = async () => {
      if (getBase64Content) {
        return getBase64Content()
      } else if (getStringContent) {
        const stringContent = await getStringContent()
        const buffer = Buffer.from(stringContent, 'utf-8')

        return buffer.toString('base64')
      } else {
        throw new Error('No content getter provided')
      }
    }
    const content = await getContent()

    return {
      path: path.join(srcAssetsDir, `./${name}.ts`),
      content: getTemplate(content),
    }
  })
}

export const prepareAssets = async () => {
  await fs.mkdir(srcAssetsDir, { recursive: true })
  const assets = await getAssets()
  await Promise.all(
    assets.map(async ({ path, content }) => {
      await fs.writeFile(path, content)
    }),
  )
}

export const assets = async () => {
  await fs.mkdir(srcAssetsDir, { recursive: true })
  await Promise.all(
    assetsList.map(async ({ name, getBase64Content, getStringContent }) => {
      const getContent = async () => {
        if (getBase64Content) {
          return getBase64Content()
        } else if (getStringContent) {
          const stringContent = await getStringContent()
          const buffer = Buffer.from(stringContent, 'utf-8')

          return buffer.toString('base64')
        } else {
          throw new Error('No content getter provided')
        }
      }
      const content = await getContent()
      await fs.writeFile(path.join(srcAssetsDir, `./${name}.ts`), getTemplate(content))
    }),
  )

  console.log('Assets prepared')
}

assets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
