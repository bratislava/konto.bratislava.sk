import { transform } from 'saxon-js'

/**
 * Returns XSLT 3.0 transformation
 *
 * @remarks
 * To compile a stylesheet held in xslt to a SEF file, use the command line
 * `xslt3 -xsl:schema.xslt -export:schema.sef.json -t`
 *
 * @param stylesheet - Stylesheet in SEF format
 * @param data - Data in XML format
 * @returns transformed data
 */

interface SaxonJsOutput {
  principalResult?: string
}

export const transformSaxon = async (
  stylesheet: any,
  data: string,
): Promise<string | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  const output: SaxonJsOutput = await transform(
    {
      stylesheetInternal: stylesheet,
      sourceText: data,
      destination: 'serialized',
    },
    'async',
  )

  return output.principalResult
}
