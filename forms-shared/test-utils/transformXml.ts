import tmp from 'tmp-promise'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Transforms an XML string using the provided XSLT string.
 *
 * This function uses the Saxon XSLT processor to perform the transformation.
 * It assumes Saxon is installed in the Docker container as per the Dockerfile.
 */
export async function transformXml(xmlString: string, xsltString: string): Promise<string> {
  const { path: xmlInputPath, cleanup: cleanupXmlInput } = await tmp.file({ postfix: '.xml' })
  const { path: xsltInputPath, cleanup: cleanupXsltInput } = await tmp.file({ postfix: '.xsl' })
  const { path: outputPath, cleanup: cleanupOutput } = await tmp.file({ postfix: '.xml' })

  try {
    await fs.writeFile(xmlInputPath, xmlString)
    await fs.writeFile(xsltInputPath, xsltString)

    const saxonCommand = `java -jar ${process.env.SAXON_HOME}/saxon-he-12.5.jar -s:${xmlInputPath} -xsl:${xsltInputPath} -o:${outputPath}`

    await execAsync(saxonCommand)

    return await fs.readFile(outputPath, 'utf-8')
  } finally {
    await Promise.all([cleanupXmlInput(), cleanupXsltInput(), cleanupOutput()])
  }
}
