"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSlovenskoSkXmlnsString = exports.getSlovenskoSkMetaIdentifier = exports.getSlovenskoSkXmlns = void 0;
const getSlovenskoSkXmlns = (formDefinition) => `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`;
exports.getSlovenskoSkXmlns = getSlovenskoSkXmlns;
const getSlovenskoSkMetaIdentifier = (formDefinition) => `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`;
exports.getSlovenskoSkMetaIdentifier = getSlovenskoSkMetaIdentifier;
function parseSlovenskoSkXmlnsString(xmlnsString) {
    const regex = /^http:\/\/schemas\.gov\.sk\/form\/([^/]+)\/([^/]+)$/;
    const match = xmlnsString.match(regex);
    if (!match) {
        return null;
    }
    const [, pospID, pospVersion] = match;
    return {
        pospID,
        pospVersion,
    };
}
exports.parseSlovenskoSkXmlnsString = parseSlovenskoSkXmlnsString;
