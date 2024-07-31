import tmp from 'tmp-promise'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SAXON_JAR: string
    }
  }
}

const execAsync = promisify(exec)

/**
 * Transforms an XML string using the provided XSLT string.
 */
export async function transformXmlWithXslt(xmlString: string, xsltString: string): Promise<string> {
  const { path: xmlInputPath, cleanup: cleanupXmlInput } = await tmp.file({ postfix: '.xml' })
  const { path: xsltInputPath, cleanup: cleanupXsltInput } = await tmp.file({ postfix: '.xslt' })
  const { path: xmlOutputPath, cleanup: cleanupXmlOutput } = await tmp.file({ postfix: '.xml' })

  try {
    await fs.writeFile(xmlInputPath, xmlString)
    await fs.writeFile(xsltInputPath, xsltString)

    const saxonCommand = `java -jar ${process.env.SAXON_JAR} -s:${xmlInputPath} -xsl:${xsltInputPath} -o:${xmlOutputPath}`

    await execAsync(saxonCommand)

    return await fs.readFile(xmlOutputPath, 'utf-8')
  } finally {
    await Promise.all([cleanupXmlInput(), cleanupXsltInput(), cleanupXmlOutput()])
  }
}
