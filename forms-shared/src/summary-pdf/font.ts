import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

const cssFilePath = path.join(__dirname, '..', '..', 'node_modules', 'inter-ui', 'inter.css')

async function encodeFileToBase64(filePath: string): Promise<string> {
  const fileBuffer = await readFile(filePath)
  return fileBuffer.toString('base64')
}

export async function inlineFontsInCssAsString(): Promise<string> {
  try {
    let cssContent = await readFile(cssFilePath, { encoding: 'utf8' })

    const fontFileRegex = /url\(["']?(.+?)["']?\)/g
    let match: RegExpExecArray | null

    while ((match = fontFileRegex.exec(cssContent))) {
      let fontUrl = match[1]
      // Remove any query string from the font URL
      const queryIndex = fontUrl.indexOf('?')
      if (queryIndex !== -1) {
        fontUrl = fontUrl.substring(0, queryIndex)
      }
      const fontPath = path.join(cssFilePath, fontUrl)
      const fontBase64 = await encodeFileToBase64(fontPath)
      const fontExtension = path.extname(fontUrl).slice(1)

      const dataUri = `data:font/${fontExtension};base64,${fontBase64}`
      // Replace the original URL (including potential query string) with the data URI
      cssContent = cssContent.replace(match[0], `url("${dataUri}")`)
    }

    return cssContent
  } catch (error) {
    console.error('Error processing CSS file:', error)
    return '' // Return an empty string or handle the error as needed
  }
}
