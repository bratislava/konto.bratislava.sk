import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'
import { attachementsXml } from './file-templates/attachementsXml'
import { attachementsPospXml } from './file-templates/attachmentsPospXml'
import { getEmptyXml } from './file-templates/emptyXml'
import { getFoXslt } from './file-templates/foXslt'
import { getHtmlSbXslt } from './file-templates/htmlSbXslt'
import { manifestXml } from './file-templates/manifestXml'
import { getMetaXml } from './file-templates/metaXml'
import { mimetype } from './file-templates/mimetype'
import { getSchemaXsd } from './file-templates/schemaXsd'

export function getSlovenskoSkContainerFiles(
  formDefinition: FormDefinitionSlovenskoSk,
  validFrom: string,
) {
  return {
    'attachments.xml': attachementsXml,
    'Attachments/posp.xml': attachementsPospXml,
    'Content/form.fo.xslt': getFoXslt(formDefinition),
    'Content/form.html.xslt': getHtmlSbXslt(formDefinition),
    'Content/form.sb.xslt': getHtmlSbXslt(formDefinition),
    'META-INF/manifest.xml': manifestXml,
    'data.xml': getEmptyXml(formDefinition),
    'meta.xml': getMetaXml(formDefinition, validFrom),
    'schema.xsd': getSchemaXsd(formDefinition),
    mimetype: mimetype,
  }
}
