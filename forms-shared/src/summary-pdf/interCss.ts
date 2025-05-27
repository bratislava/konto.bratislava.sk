import * as path from 'path'
import { injectBase64 } from 'node-font2base64'
import fs from 'node:fs'

const getInlinedFontCssByPath = async (filePath: string) => {
  const cssFileContents = fs.readFileSync(filePath, 'utf8')
  const fontsDirName = path.dirname(filePath)
  const { content } = await injectBase64.fromContent(fontsDirName, cssFileContents)
  if (!content) {
    throw new Error('Failed to inject base64')
  }

  return content
}

export const getInterCss = async () => {
  const paths = [
    require.resolve('@fontsource/inter/latin.css'),
    require.resolve('@fontsource/inter/latin-ext.css'),
  ]
  const css = await Promise.all(paths.map(getInlinedFontCssByPath))

  return css.join('\n')
}
