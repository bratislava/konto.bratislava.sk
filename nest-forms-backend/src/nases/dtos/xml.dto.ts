export type XmlObject = {
  $: {
    Id?: string
    IsSigned: string
    Name: string
    Description: string
    Class: string
    MimeType: string
    Encoding: string
  }
  _?: string
}

export type XmlObjectList = XmlObject[]
