import tmp from 'tmp-promise'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FOP_JAR: string
      FOP_LIB: string
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

/**
 * Renders a PDF using Apache FOP based on the provided XML and XSL strings.
 *
 * Based on the reference guide https://www.slovensko.sk/_img/CMS4/Navody/navod_registracia_eform_ovm.pdf (version 42,
 * 24.7.2024):
 *  - Apache FOP 1.1 must be used
 *  - The official FOP configuration file from Slovensko.sk must be used
 *  - An example command `fop -xml data.xml -c conf/fop.xconf -xsl form.x.fo.xsl -pdf vystup.pdf` is provided
 */
export async function renderApacheFopPdf(xmlString: string, xslString: string) {
  const { path: xmlInputPath, cleanup: cleanupXmlInput } = await tmp.file({ postfix: '.xml' })
  const { path: xslInputPath, cleanup: cleanupXslInput } = await tmp.file({ postfix: '.xsl' })
  const { path: pdfOutputPath, cleanup: cleanupPdfOutput } = await tmp.file({ postfix: '.pdf' })
  const { path: fopConfigPath, cleanup: cleanupFopConfig } = await fixFopConfig()

  try {
    await fs.writeFile(xmlInputPath, xmlString)
    await fs.writeFile(xslInputPath, xslString)

    const javaCommand = `java -cp ${process.env.FOP_JAR}:${process.env.FOP_LIB}/* org.apache.fop.cli.Main -xml ${xmlInputPath} -c ${fopConfigPath} -xsl ${xslInputPath} -pdf ${pdfOutputPath}`

    await execAsync(javaCommand)

    return await fs.readFile(pdfOutputPath)
  } finally {
    await Promise.all([
      cleanupXmlInput(),
      cleanupXslInput(),
      cleanupPdfOutput(),
      cleanupFopConfig(),
    ])
  }
}
