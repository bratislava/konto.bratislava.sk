/**
 * Shared markdown content for styleguide showcases.
 */
export const styleguideMarkdownContent = `

---
###### Paragraphs

Paragraph 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fringilla ac arcu quis pulvinar. Morbi vulputate, ipsum sed bibendum sollicitudin, neque ex lacinia sem, nec tincidunt nunc massa vel mauris.

Paragraph 2: Morbi in molestie libero. Nulla elementum orci a quam tempus, non gravida lacus lobortis. Ut vitae aliquet erat. Vestibulum congue odio a orci efficitur, sit amet rhoncus lorem iaculis. Nullam eu imperdiet dolor, at rutrum metus.

_italic_ *text*, **bold** __text__, ~~strikethrough text~~, 21^st^, H~2~O, E = mc^2^

---
###### Headers

# Header 1 is not supported, because it is reserved for page title
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6

---
###### URL Links

[External link - Bratislava](https://www.bratislava.sk/)
[Internal link - Moje žiadosti](moje-ziadosti)
[Anchor link - Moje žiadosti](#anchor-name)
[0900 123 456](tel:0900123456)
[example@example.com](mailto:example@example.com)

---
###### Ordered lists (use 4 spaces)

1. Aenean rutrum augue in dictum tempus
2. Lorem ipsum dolor sit amet
    1. Cras sed metus ut orci sodales fringilla
        1. Sed vehicula scelerisque augue
        2. Facilisis in pretium nisl aliquet
        3. Nulla volutpat aliquam velit
    2. Lorem ipsum dolor sit amet
3. Nam lacinia mauris in sollicitudin ornare
4. Quisque eu nunc ac elit maximus efficitur

---
###### Unordered list

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
      + Lorem ipsum
+ Very easy!

---
###### Blockquotes

> blockquote
>> blockquote 
>>> _italic_ **bold text** ~~strikethrough~~

---
###### Code

This sentence contains \`inline code\` in the middle of it.

\`\`\`
const CodeBlockExample = () => {
  return <div>Hello world</div>
}
\`\`\`

---

| Column A | Column B |
| --- | --- |
| Alpha | One |
| Beta | Two |

---
###### Image

![Accessible alt text](/apple-touch-icon.png "Caption shown below the image")

---
###### Custom components (Markdown only)

Tooltip :tooltip[Tooltip text]

---
###### Custom components (FormMarkdown only)

Daňový rok: :tax-year

Nasledujúci rok: :tax-year-next

Form image preview: :form-image-preview[Zobraziť ukážku]{src="https://general-strapi.s3.bratislava.sk/upload/5_stavba_spoluvlastnicky_podiel_d931ee97e7.png"}

`
