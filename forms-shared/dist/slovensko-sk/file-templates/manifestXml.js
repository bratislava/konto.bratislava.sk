"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestXml = void 0;
exports.manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:Manifest
  xmlns:attachment="urn:attachment:1.0"
  xmlns:attachmentfile="urn:attachmentfile:1.0"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:setting="urn:setting:1.0"
  xmlns:meta="urn:meta:1.0"
  xmlns:content="urn:content:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:presentation="urn:presentation:1.0"
  xmlns:data="urn:data:1.0"
  xmlns:manifest="urn:manifest:1.0"
>
  <manifest:file-entry
    media-type="application/xslt+xml"
    media-destination="print"
    media-destination-type="application/xml"
    media-destination-type-description="XSLFO"
    media-language="SK"
    full-path="Content\\form.fo.xslt"
    filename="form.fo.xslt"
    description="XSLT transformácia na zobrazenie v PDF"
    xslfo-reference-procesor="Apache FOP 1.1"
    xslfo-reference-procesor-url="http://archive.apache.org/dist/xmlgraphics/fop/binaries/fop-1.1-bin.zip"
  />
  <manifest:file-entry
    media-type="application/xslt+xml"
    media-destination="view"
    media-destination-type="text/html"
    media-destination-type-description="HTML"
    media-language="SK"
    full-path="Content\\form.html.xslt"
    filename="form.html.xslt"
    description="XSLT transformácia do HTML"
  />
  <manifest:file-entry
    media-type="application/xslt+xml"
    media-destination="sign"
    media-destination-type="text/html"
    media-destination-type-description="HTML"
    media-language="SK"
    full-path="Content\\form.sb.xslt"
    filename="form.sb.xslt"
    description="XSLT transformácia do HTML pre zobrazenie pre podpisovač"
  />
  <manifest:file-entry 
    media-type="text/xml" 
    media-language="SK" 
    full-path="schema.xsd" 
    filename="schema.xsd" 
    description="XSD schéma pre výsledný elektronický dokument XML"
  />
  <manifest:file-entry 
    media-type="text/xml" 
    media-language="SK" 
    full-path="data.xml" 
    filename="data.xml" 
    description="Prázdny elektronický dokument XML"
  />
  <manifest:file-entry 
    media-type="text/xml" 
    media-language="SK" 
    full-path="meta.xml" 
    filename="meta.xml"
    description="XML súbor s metadátami"
  />
  <manifest:file-entry 
    media-type="text/xml" 
    media-language="SK" 
    full-path="attachments.xml" 
    filename="attachments.xml"
    description="XML súbor s prílohami"
  />
</manifest:Manifest>
`;
