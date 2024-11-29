"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlovenskoSkContainerFiles = void 0;
const attachementsXml_1 = require("./file-templates/attachementsXml");
const attachmentsPospXml_1 = require("./file-templates/attachmentsPospXml");
const foXslt_1 = require("./file-templates/foXslt");
const htmlSbXslt_1 = require("./file-templates/htmlSbXslt");
const manifestXml_1 = require("./file-templates/manifestXml");
const metaXml_1 = require("./file-templates/metaXml");
const schemaXsd_1 = require("./file-templates/schemaXsd");
const mimetype_1 = require("./file-templates/mimetype");
const emptyXml_1 = require("./file-templates/emptyXml");
function getSlovenskoSkContainerFiles(formDefinition, validFrom) {
    return {
        'attachments.xml': attachementsXml_1.attachementsXml,
        'Attachments/posp.xml': attachmentsPospXml_1.attachementsPospXml,
        'Content/form.fo.xslt': (0, foXslt_1.getFoXslt)(formDefinition),
        'Content/form.html.xslt': (0, htmlSbXslt_1.getHtmlSbXslt)(formDefinition),
        'Content/form.sb.xslt': (0, htmlSbXslt_1.getHtmlSbXslt)(formDefinition),
        'META-INF/manifest.xml': manifestXml_1.manifestXml,
        'data.xml': (0, emptyXml_1.getEmptyXml)(formDefinition),
        'meta.xml': (0, metaXml_1.getMetaXml)(formDefinition, validFrom),
        'schema.xsd': (0, schemaXsd_1.getSchemaXsd)(formDefinition),
        mimetype: mimetype_1.mimetype,
    };
}
exports.getSlovenskoSkContainerFiles = getSlovenskoSkContainerFiles;
