import * as path from 'node:path'
import fs from 'node:fs/promises'

const fontMimeTypes: Record<string, string> = {
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

// Example: url(./files/inter-latin-ext-100-normal.woff2) format('woff2')
const fontSourceUrlRegex = /url\((\.\/files\/[^)]+)\) format\('([^']+)'\)/g

const getInlinedFontCssByPath = async (filePath: string) => {
  let css = await fs.readFile(filePath, 'utf8')
  const cssDir = path.dirname(filePath)
  const urlMatches = [...css.matchAll(fontSourceUrlRegex)]

  if (urlMatches.length === 0) {
    throw new Error(`No Fontsource font URLs found in ${filePath}`)
  }

  for (const match of urlMatches) {
    const [fontUrlDeclaration, fontUrl, format] = match

    const fontPath = path.resolve(cssDir, fontUrl)
    const mimeType = fontMimeTypes[path.extname(fontPath)]

    if (!mimeType) {
      throw new Error(`Unsupported font type: ${fontPath}`)
    }

    const base64 = await fs.readFile(fontPath, 'base64')
    css = css.replace(
      fontUrlDeclaration,
      `url(data:${mimeType};base64,${base64}) format('${format}')`,
    )
  }

  return css
}

export const getInterCss = async () => {
  const paths = [
    require.resolve('@fontsource/inter/latin.css'),
    require.resolve('@fontsource/inter/latin-ext.css'),
  ]
  const css = await Promise.all(paths.map(getInlinedFontCssByPath))

  return css.join('\n')
}
