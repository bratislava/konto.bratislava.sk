import tmp from 'tmp-promise'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FOP_HOME: string
      SLOVENSKO_FOP_CONF: string
    }
  }
}

const execAsync = promisify(exec)

/**
 * The original FOP configuration from Slovensko.sk contains a reference to a font file that is not available on Unix systems.
 */
export async function fixFopConfig() {
  const fileResult = await tmp.file({ postfix: '.xconf' })
  const originalContent = await fs.readFile(process.env.SLOVENSKO_FOP_CONF, { encoding: 'utf-8' })

  const modifiedContent = originalContent.replace(
    /<font embed-url="file:C:\/Windows\/Fonts\/Wingding.ttf">[\s\S]*?<\/font>/g,
    '',
  )

  await fs.writeFile(fileResult.path, modifiedContent, 'utf-8')
  return fileResult
}

export async function renderApacheFopPdf(xmlString: string, xslString: string) {
  const { path: xmlInput, cleanup: cleanupXml } = await tmp.file({ postfix: '.xml' })
  const { path: xslInput, cleanup: cleanupXsl } = await tmp.file({ postfix: '.xslt' })
  const { path: outputPdfPath, cleanup: cleanupOutputPdf } = await tmp.file({ postfix: '.pdf' })
  const { path: fopConfigPath, cleanup: cleanupFopConfig } = await fixFopConfig()

  try {
    await fs.writeFile(xmlInput, xmlString)
    await fs.writeFile(xslInput, xslString)

    const javaCommand = `java -cp ${process.env.FOP_HOME}/build/fop.jar:${process.env.FOP_HOME}/lib/* org.apache.fop.cli.Main -xml ${xmlInput} -c ${fopConfigPath} -xsl ${xslInput} -pdf ${outputPdfPath}`

    await execAsync(javaCommand)

    return await fs.readFile(outputPdfPath)
  } finally {
    await Promise.all([cleanupXml(), cleanupXsl(), cleanupOutputPdf(), cleanupFopConfig()])
  }
}
