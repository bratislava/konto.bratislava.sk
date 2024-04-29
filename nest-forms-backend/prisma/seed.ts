import { Prisma, PrismaClient } from '@prisma/client'

import zavazneStanovisko from '../src/utils/global-forms/zavazneStanoviskoKInvesticnejCinnosti'

const prisma = new PrismaClient()
async function main(): Promise<void> {
  const schema = await prisma.schema.create({
    data: {
      formName: 'test',
      slug: 'test',
      category: null,
      messageSubject: 'Podanie',
    },
  })

  const schemaVersion = await prisma.schemaVersion.create({
    data: {
      id: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
      version: 'v0.0.1',
      pospID: 'test',
      pospVersion: '0.1',
      formDescription: 'Example schema',
      schemaId: schema.id,
      data: {
        ziadatel: {
          firstName: 'occaecat',
          lastName: 'Excepteur',
          birthDate: 'anim Excepteur est',
          newTaxpayer: true,
          address: 'sint irure velit quis',
          postalCode: 'incididunt veniam nostrud id',
          city: 'reprehenderit id consectetur',
        },
        email: 'velit anim Duis esse',
        phone: 'ipsum',
      },
      dataXml: null,
      formFo: `<?xml version="1.0" encoding="utf-8"?>
      <xsl:stylesheet xml:lang="en" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:z="http://schemas.gov.sk/doc/eform/form/0.1"
        version="1.0" xmlns:Xsl="http://www.w3.org/1999/XSL/Transform">
      
        <xsl:template match="/z:E-form">
          <xsl:call-template name="base_eform" />
        </xsl:template>
      
        <!-- this is the template which gets called inside the FO structure -->
        <xsl:template name="body">
      
          <xsl:call-template name="base_block_with_title">
            <xsl:with-param name="template_name" select="'ziadatel'" />
            <xsl:with-param name="title" select="'Žiadateľ'" />
            <xsl:with-param name="values" select="z:Body/z:Ziadatel" />
          </xsl:call-template><xsl:call-template
            name="base_block_with_title">
            <xsl:with-param name="template_name" select="'wrapper'" />
            <xsl:with-param name="title" select="'Ostatné'" />
            <xsl:with-param name="values" select="z:Body" />
          </xsl:call-template></xsl:template>
      
        <!-- XSL cannot dynamically "yield" template, so here is simple mapping for each template based on
        name -->
        <!-- TODO better way to do this? -->
        <xsl:template name="map">
          <xsl:param name="template" />
          <xsl:param name="values" />
      
          <xsl:choose>
      
            <xsl:when test="$template = 'ziadatel'">
              <xsl:call-template name="ziadatel">
                <xsl:with-param name="values" select="$values" />
              </xsl:call-template>
            </xsl:when>
            <xsl:when test="$template = 'wrapper'">
              <xsl:call-template name="wrapper">
                <xsl:with-param name="values" select="$values" />
              </xsl:call-template>
            </xsl:when>
          </xsl:choose>
        </xsl:template>
      
        <!-- ########################## -->
        <!-- ALL templates below, prefixed with "base_", are format-specific and should not be modified. -->
        <!-- ########################## -->
      
        <xsl:template name="base_eform">
          <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
            <fo:layout-master-set>
              <fo:simple-page-master master-name="A4" page-height="842px" page-width="595px"
                margin-top="10px" margin-bottom="10px" margin-left="10px" margin-right="10px">
                <fo:region-body margin-bottom="20mm" />
                <fo:region-after region-name="footer" extent="10mm" />
              </fo:simple-page-master>
              <fo:page-sequence-master master-name="document">
                <fo:repeatable-page-master-alternatives>
                  <fo:conditional-page-master-reference master-reference="A4" />
                </fo:repeatable-page-master-alternatives>
              </fo:page-sequence-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="document" font-family="Arial">
              <fo:static-content flow-name="footer">
                <fo:block text-align="end">
                  <fo:page-number />
                </fo:block>
              </fo:static-content>
              <fo:flow flow-name="xsl-region-body">
                <fo:block font-size="20pt" text-align="center">
                  <xsl:value-of select="z:Meta/z:Name" />
                </fo:block>
                <fo:block color="white">|</fo:block>
                <fo:block />
      
                <xsl:call-template name="body" />
      
              </fo:flow>
            </fo:page-sequence>
          </fo:root>
        </xsl:template>
      
        <xsl:template name="base_block_with_title">
          <xsl:param name="template_name" />
          <xsl:param name="values" />
          <xsl:param name="title" />
      
          <xsl:if
            test="$title">
            <xsl:call-template name="base_title">
              <xsl:with-param name="title" select="$title" />
            </xsl:call-template>
          </xsl:if>
      
          <xsl:call-template
            name="base_block">
            <xsl:with-param name="template_name" select="$template_name" />
            <xsl:with-param name="values" select="$values" />
          </xsl:call-template>
        </xsl:template>
      
        <xsl:template name="base_block">
          <xsl:param name="template_name" />
          <xsl:param name="values" />
      
          <fo:block margin-left="5mm">
            <xsl:call-template name="map">
              <xsl:with-param name="template" select="$template_name" />
              <xsl:with-param name="values" select="$values" />
            </xsl:call-template>
          </fo:block>
        </xsl:template>
      
        <xsl:template name="base_format_telefonne_cislo">
          <xsl:param name="node" />
      
          <xsl:value-of
            select="concat($node/*[local-name() = 'MedzinarodneVolacieCislo'], ' ')" />
          <xsl:value-of
            select="concat($node/*[local-name() = 'Predvolba'], ' ')" />
          <xsl:value-of
            select="$node/*[local-name() = 'Cislo']" />
        </xsl:template>
      
        <xsl:template name="base_boolean">
          <xsl:param name="bool" />
      
          <xsl:choose>
            <xsl:when test="$bool = 'true'">
              <xsl:text>Áno</xsl:text>
            </xsl:when>
            <xsl:when test="$bool = 'false'">
              <xsl:text>Nie</xsl:text>
            </xsl:when>
          </xsl:choose>
        </xsl:template>
      
        <xsl:template name="base_format_date">
          <xsl:param name="instr" />
          <!-- YYYY-MM-DD -->
          <xsl:variable name="yyyy">
            <xsl:value-of select="substring($instr,1,4)" />
          </xsl:variable>
          <xsl:variable name="mm">
            <xsl:value-of select="substring($instr,6,2)" />
          </xsl:variable>
          <xsl:variable name="dd">
            <xsl:value-of select="substring($instr,9,2)" />
          </xsl:variable>
      
          <xsl:value-of
            select="concat($dd,'.',$mm,'.',$yyyy)" />
        </xsl:template>
      
        <xsl:template name="base_format_datetime">
          <xsl:param name="dateTime" />
          <xsl:variable name="dateTimeString" select="string($dateTime)" />
          <xsl:choose>
            <xsl:when
              test="$dateTimeString!= '' and string-length($dateTimeString)>18 and string(number(substring($dateTimeString, 1, 4))) != 'NaN' ">
              <xsl:value-of
                select="concat(substring($dateTimeString, 9, 2), '.', substring($dateTimeString, 6, 2), '.', substring($dateTimeString, 1, 4),' ', substring($dateTimeString, 12, 2),':', substring($dateTimeString, 15, 2))" />
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$dateTimeString" />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:template>
      
        <xsl:template name="base_title">
          <xsl:param name="title" />
      
          <fo:block margin-left="5mm" margin-top="2mm">
            <fo:block padding-left="2mm">
              <xsl:value-of select="$title" />
            </fo:block>
          </fo:block>
        </xsl:template>
      
        <xsl:template name="base_labeled_field">
          <xsl:param name="text" />
          <xsl:param name="node" />
      
          <fo:table space-before="2mm">
            <fo:table-column />
            <fo:table-column column-width="300px" />
            <fo:table-body>
              <fo:table-row>
                <fo:table-cell>
                  <fo:block>
                    <xsl:value-of select="$text" />
                  </fo:block>
                </fo:table-cell>
                <xsl:choose>
                  <xsl:when test="$node">
                    <fo:table-cell border-width="0.6pt" border-style="solid" background-color="white"
                      padding="1pt">
                      <fo:block>
                        <xsl:value-of select="$node" />
                        <fo:inline color="white">___</fo:inline>
                      </fo:block>
                    </fo:table-cell>
                  </xsl:when>
                  <xsl:otherwise>
                    <fo:table-cell>
                      <fo:block />
                    </fo:table-cell>
                  </xsl:otherwise>
                </xsl:choose>
              </fo:table-row>
            </fo:table-body>
          </fo:table>
        </xsl:template>
      
        <xsl:template name="base_labeled_textarea">
          <xsl:param name="text" />
          <xsl:param name="node" />
      
          <xsl:call-template name="base_labeled_field">
            <xsl:with-param name="text" select="$text" />
            <xsl:with-param name="node" select="$node" />
          </xsl:call-template>
        </xsl:template>
        <xsl:template name="ziadatel"><xsl:param name="values" /><xsl:if test="$values/z:FirstName"><xsl:call-template
              name="base_labeled_field">
              <xsl:with-param name="text" select="'firstName'" />
              <xsl:with-param name="node" select="$values/z:FirstName" />
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:LastName"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'lastName'" />
              <xsl:with-param name="node" select="$values/z:LastName" />
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:BirthDate"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'birthDate'" />
              <xsl:with-param name="node" select="$values/z:BirthDate" />
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:NewTaxpayer"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'newTaxpayer'" />
              <xsl:with-param name="node"><xsl:call-template name="base_boolean">
                  <xsl:with-param name="bool" select="$values/z:NewTaxpayer" />
                </xsl:call-template></xsl:with-param>
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:Address"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'address'" />
              <xsl:with-param name="node" select="$values/z:Address" />
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:PostalCode"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'postalCode'" />
              <xsl:with-param name="node" select="$values/z:PostalCode" />
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:City"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'city'" />
              <xsl:with-param name="node" select="$values/z:City" />
            </xsl:call-template></xsl:if></xsl:template>
        <xsl:template name="wrapper"><xsl:param name="values" /><xsl:if test="$values/z:Email"><xsl:call-template
              name="base_labeled_field">
              <xsl:with-param name="text" select="'email'" />
              <xsl:with-param name="node" select="$values/z:Email" />
            </xsl:call-template></xsl:if><xsl:if
            test="$values/z:Phone"><xsl:call-template name="base_labeled_field">
              <xsl:with-param name="text" select="'phone'" />
              <xsl:with-param name="node" select="$values/z:Phone" />
            </xsl:call-template></xsl:if></xsl:template>
      </xsl:stylesheet>`,
      jsonSchema: {
        pospID: 'test',
        pospVersion: '0.1',
        title: 'Example',
        description: 'Example schema',
        type: 'object',
        allOf: [
          {
            properties: {
              mestoPSCstep: {
                type: 'object',
                title: 'Mesto PSC step',
                properties: {
                  mestoPSC: {
                    required: ['psc', 'mesto'],
                    type: 'object',
                    properties: {
                      mesto: {
                        type: 'string',
                        title: 'Mesto',
                        default: 'Košice',
                      },
                      psc: {
                        type: 'string',
                        title: 'PSČ',
                        format: 'zip',
                      },
                    },
                  },
                },
                required: ['mestoPSC'],
              },
            },
            required: ['mestoPSCstep'],
          },
          {
            allOf: [
              {
                if: {
                  properties: {
                    mestoPSCstep: {
                      properties: {
                        mestoPSC: {
                          required: ['psc'],
                          properties: {
                            psc: {
                              const: '82103',
                            },
                          },
                        },
                      },
                      required: ['mestoPSC'],
                    },
                  },
                  required: ['mestoPSCstep'],
                },
                then: {
                  properties: {
                    conditionalStep: {
                      type: 'object',
                      title: 'Conditional step',
                      properties: {
                        randomInput: {
                          type: 'string',
                          title: 'Input in conditional step',
                        },
                      },
                    },
                  },
                  required: ['conditionalStep'],
                },
              },
            ],
          },
          {
            properties: {
              dateTimePickerShowcase: {
                type: 'object',
                properties: {
                  dateTimePicker: {
                    required: ['dateValue', 'timeValue'],
                    type: 'object',
                    properties: {
                      dateValue: {
                        type: 'string',
                        format: 'date',
                        title: 'Date',
                      },
                      timeValue: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time',
                      },
                    },
                  },
                },
                title: 'Showcase of DateTime Picker',
              },
            },
            required: ['dateTimePickerShowcase'],
          },
          {
            properties: {
              timeFromToShowcase: {
                title: 'Showcase of TimeFromTo Picker',
                type: 'object',
                properties: {
                  timeFromTo: {
                    timeFromTo: true,
                    type: 'object',
                    properties: {
                      startTime: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time From',
                      },
                      endTime: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time To',
                      },
                    },
                  },
                },
              },
            },
            required: ['timeFromToShowcase'],
          },
          {
            properties: {
              dateFromToShowcase: {
                title: 'Showcase of DateFromTo Picker',
                type: 'object',
                properties: {
                  dateFromTo: {
                    required: ['startDate', 'endDate'],
                    dateFromTo: true,
                    type: 'object',
                    properties: {
                      startDate: {
                        type: 'string',
                        format: 'date',
                        title: 'Date From',
                      },
                      endDate: {
                        type: 'string',
                        format: 'date',
                        title: 'Date To',
                      },
                    },
                  },
                },
              },
            },
            required: ['dateFromToShowcase'],
          },
          {
            properties: {
              datePickerWithTimePicker: {
                title: 'Showcase of DatePicker and TimePicker',
                type: 'object',
                properties: {
                  datePicker: {
                    title: 'Showcase of DatePicker',
                    required: [],
                    type: 'object',
                    properties: {
                      birth: {
                        type: 'string',
                        format: 'date',
                        title: 'Birth date',
                      },
                    },
                  },
                  timePicker: {
                    title: 'Showcase of TimePicker',
                    required: ['meeting-time'],
                    type: 'object',
                    properties: {
                      'meeting-time': {
                        type: 'string',
                        title: 'Meeting time',
                        format: 'localTime',
                      },
                    },
                  },
                },
              },
            },
            required: ['datePickerWithTimePicker'],
          },
          {
            properties: {
              inputFields: {
                title: 'Showcase of InputField',
                type: 'object',
                required: ['firstName', 'lastName'],
                properties: {
                  firstName: {
                    type: 'string',
                    title: 'First Name',
                    default: 'Anton',
                  },
                  lastName: {
                    type: 'string',
                    title: 'Last Name',
                    default: 'Peluha',
                  },
                  password: {
                    type: 'string',
                    title: 'Password',
                  },
                  psc: {
                    type: 'string',
                    title: 'PSC',
                    format: 'zip',
                  },
                  textAreas: {
                    title: 'Textove polia',
                    type: 'object',
                    required: ['pros'],
                    properties: {
                      pros: {
                        title: 'Pros',
                        type: 'string',
                      },
                      cons: {
                        title: 'Cons',
                        type: 'string',
                        default: 'Defaultna hodnota',
                      },
                    },
                  },
                },
              },
            },
            required: ['inputFields'],
          },
          {
            properties: {
              selectFields: {
                title: 'Ukazka Selectov',
                type: 'object',
                required: ['school'],
                properties: {
                  school: {
                    type: 'string',
                    title: 'University',
                    comment: 'Single choice select need to have default value',
                    default: 'stu_fei',
                    oneOf: [
                      {
                        const: 'stu_fei',
                        title: 'STU FEI',
                        description: 'fakulta elektrotechniky a informatiky',
                      },
                      {
                        const: 'stu_fchpt',
                        title: 'STU FCHPT',
                      },
                      {
                        const: 'stu_fiit',
                        title: 'STU FIIT',
                        description:
                          'fakulta informatiky a informacnych technologii',
                      },
                    ],
                  },
                  diplomas: {
                    type: 'array',
                    title: 'Reached diplomas',
                    uniqueItems: true,
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'stu_fei',
                          title: 'STU FEI',
                          description: 'fakulta elektrotechniky a informatiky',
                        },
                        {
                          const: 'stu_fchpt',
                          title: 'STU FCHPT',
                        },
                        {
                          const: 'stu_fiit',
                          title: 'STU FIIT',
                          description:
                            'fakulta informatiky a informacnych technologii',
                        },
                      ],
                    },
                  },
                  years: {
                    type: 'number',
                    title: 'Years in school',
                    uniqueItems: true,
                    oneOf: [
                      {
                        const: 1,
                      },
                      {
                        const: 2,
                      },
                      {
                        const: 3,
                      },
                    ],
                  },
                  street: {
                    type: 'string',
                    title: 'Street (ciselnik)',
                    format: 'ciselnik',
                    ciselnik: {
                      id: 'POST_STREET',
                    },
                  },
                  city: {
                    type: 'string',
                    title: 'City (ciselnik)',
                    format: 'ciselnik',
                    ciselnik: {
                      id: 'SUSR_0025',
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      properties: {
                        school: {
                          const: 'stu_fchpt',
                        },
                      },
                    },
                    then: {
                      properties: {
                        conditionalSchool: {
                          type: 'string',
                          title: 'Was fchpt good? (conditional field)',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      oneOf: [
                        {
                          properties: {
                            diplomas: {
                              const: ['stu_fei', 'stu_fiit'],
                            },
                          },
                        },
                        {
                          properties: {
                            diplomas: {
                              const: ['stu_fiit'],
                            },
                          },
                        },
                        {
                          properties: {
                            diplomas: {
                              const: ['stu_fei'],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      properties: {
                        conditionalDiplomas: {
                          type: 'string',
                          title:
                            'How was your IT experience? (conditional field)',
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['selectFields'],
          },
          {
            properties: {
              fileUploads: {
                title: 'Nahratie suborov',
                type: 'object',
                required: ['importButtonMultipleFiles'],
                properties: {
                  importButtonOneFile: {
                    title: 'Importuj jeden subor',
                    type: 'string',
                    format: 'file',
                  },
                  importButtonMultipleFiles: {
                    title: 'Importuj viac suborov',
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'file',
                    },
                    minItems: 1,
                  },
                  importDragAndDropOneFile: {
                    title: 'Presun sem jeden subor',
                    type: 'string',
                    format: 'file',
                  },
                  importDragAndDropMultipleFiles: {
                    title: 'Presun sem viac suborov',
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'file',
                    },
                  },
                },
              },
            },
            required: ['fileUploads'],
          },
          {
            properties: {
              chooseOneOf: {
                title: 'Radio button step',
                type: 'object',
                required: ['chooseOneOfMore'],
                properties: {
                  chooseOneOfMore: {
                    type: 'string',
                    title: 'Some random choose',
                    comment: 'Radio buttons need to have default value',
                    oneOf: [
                      {
                        const: 'screen',
                        title: 'Screen',
                      },
                      {
                        const: 'multiply',
                        title: 'Multiply',
                      },
                      {
                        const: 'overlay',
                        title: 'Overlay',
                      },
                    ],
                  },
                  chooseOneOfTwo: {
                    type: 'string',
                    title: 'Some random choose',
                    oneOf: [
                      {
                        const: 'Ano',
                        title: 'Ano',
                      },
                      {
                        const: 'Nie',
                        title: 'Nie',
                      },
                    ],
                  },
                },
                allOf: [
                  {
                    if: {
                      properties: {
                        chooseOneOfMore: {
                          const: 'overlay',
                        },
                      },
                    },
                    then: {
                      required: ['overlayInput'],
                      properties: {
                        overlayInput: {
                          type: 'string',
                          title: 'WRITE OVERLAY INPUT (conditional field)',
                        },
                      },
                    },
                    else: {
                      properties: {
                        notOverlayInput: {
                          type: 'string',
                          title: 'some other input',
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['chooseOneOf'],
          },
          {
            properties: {
              checkBoxes: {
                title: 'Checkboxes',
                type: 'object',
                required: ['favouriteFruits'],
                properties: {
                  favouriteFruits: {
                    type: 'array',
                    title: 'Fruits max 3 items',
                    minItems: 1,
                    maxItems: 3,
                    uniqueItems: true,
                    items: {
                      anyOf: [
                        {
                          title: 'Orange',
                          const: 'orange',
                        },
                        {
                          title: 'Banana',
                          const: 'banana',
                        },
                        {
                          title: 'Grape',
                          const: 'grape',
                        },
                        {
                          title: 'Kiwi',
                          const: 'kiwi',
                        },
                        {
                          title: 'Apple',
                          const: 'apple',
                        },
                        {
                          title: 'Plum',
                          const: 'plum',
                        },
                      ],
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      oneOf: [
                        {
                          properties: {
                            favouriteFruits: {
                              const: ['plum'],
                            },
                          },
                        },
                        {
                          properties: {
                            favouriteFruits: {
                              const: ['apple'],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      properties: {
                        checkboxBonus: {
                          title: 'This will show when we will click plum',
                          type: 'object',
                          required: ['firstBonus'],
                          properties: {
                            firstBonus: {
                              type: 'string',
                              title: 'First bonus (conditional field)',
                            },
                            secondBonus: {
                              type: 'string',
                              title: 'Second bonus (conditional field)',
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['checkBoxes'],
          },
        ],
      },
      uiSchema: {
        mestoPSCstep: {
          mestoPSC: {
            'ui:field': 'doubledInput',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              FirstInputTooltip: 'Mesto tooltip',
              FirstInputDescription: 'Description',
              FirstInputPlaceholder: 'placeholder text',
              FirstInputRequired: true,
              FirstInputResetIcon: true,
              FirstInputLeftIcon: 'person',
              FirstInputExplicitOptional: true,
              FirstInputClassNames: 'w-full',
              SecondInputClassNames: 'w-1/4',
              spaceTop: 'large',
            },
          },
        },
        dateTimePickerShowcase: {
          dateTimePicker: {
            'ui:field': 'dateTime',
            'ui:hideError': true,
            'ui:options': {
              TimeTooltip: 'Time tooltip',
              DateTooltip: 'Time tooltip',
              DateDescription: 'From desc',
            },
          },
        },
        timeFromToShowcase: {
          timeFromTo: {
            'ui:field': 'timeFromTo',
            'ui:hideError': true,
            'ui:options': {
              TimeFromTooltip: 'Time tooltip',
              TimeToTooltip: 'Time tooltip',
              TimeFromDescription: 'From desc',
              TimeToDescription: 'To desc',
            },
          },
        },
        dateFromToShowcase: {
          dateFromTo: {
            'ui:hideError': true,
            'ui:field': 'dateFromTo',
            'ui:options': {
              DateFromTooltip: 'From tooltip',
              DateToTooltip: 'To tooltip',
              DateFromDescription: 'From desc',
              DateToDescription: 'To desc',
            },
          },
        },
        datePickerWithTimePicker: {
          datePicker: {
            'ui:hideError': true,
            birth: {
              'ui:widget': 'DatePicker',
              'ui:label': false,
              'ui:accordion': [
                {
                  title: 'Header name 1',
                  size: 'lg',
                  shadow: true,
                  content:
                    "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
                },
                {
                  title: 'Header name 2',
                  size: 'sm',
                  content:
                    "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
                },
              ],
              'ui:options': {
                tooltip: 'Date picker hint',
              },
            },
          },
          timePicker: {
            'ui:hideError': true,
            'meeting-time': {
              'ui:widget': 'TimePicker',
              'ui:label': false,
              'ui:accordion': {
                title: 'Header name',
                size: 'sm',
                content:
                  "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
              },
              'ui:options': {
                tooltip: 'Time picker hint',
              },
            },
          },
        },
        inputFields: {
          'ui:hideError': true,
          firstName: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'First Name',
            'ui:accordion': {
              title: 'Header name',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              tooltip: 'First name hint',
              resetIcon: true,
              leftIcon: 'person',
              size: 'large',
              spaceTop: 'large',
            },
          },
          lastName: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Last Name',
            'ui:accordion': {
              title: 'Header name',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              tooltip: 'Last name hint',
              resetIcon: true,
              leftIcon: 'person',
              size: 'default',
            },
          },
          phone: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Phone',
            'ui:options': {
              tooltip: 'Phone hint',
              resetIcon: true,
              leftIcon: 'call',
              size: 'default',
              explicitOptional: 'left',
            },
          },
          password: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Password',
            'ui:options': {
              tooltip: 'Password hint',
              leftIcon: 'lock',
              type: 'password',
              explicitOptional: 'right',
            },
          },
          psc: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'PSC',
            'ui:options': {
              tooltip: 'PSC hint, only numbers',
              helptext: 'Only numbers',
              size: 'small',
            },
          },
          textAreas: {
            'ui:order': ['pros', 'cons'],
            pros: {
              'ui:widget': 'TextArea',
              'ui:label': false,
              'ui:placeholder': 'Write some cons please',
              'ui:options': {
                description: 'Here write pros',
                tooltip: 'This is simple tooltip',
              },
            },
            cons: {
              'ui:widget': 'TextArea',
              'ui:label': false,
            },
          },
        },
        fileUploads: {
          'ui:hideError': true,
          'ui:order': [
            'importButtonOneFile',
            'importButtonMultipleFiles',
            'importDragAndDropOneFile',
            'importDragAndDropMultipleFiles',
          ],
          importButtonOneFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              type: 'button',
              helptext:
                'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.\nPrílohy nemôžu presiahnuť veľkosť 250MB.',
            },
          },
          importButtonMultipleFiles: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
          importDragAndDropOneFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'dragAndDrop',
            },
          },
          importDragAndDropMultipleFiles: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              type: 'dragAndDrop',
            },
          },
        },
        textAreas: {
          'ui:hideError': true,
          pros: {
            'ui:widget': 'TextArea',
            'ui:label': false,
            'ui:placeholder': 'Write some cons please',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              helptext: 'Here write pros',
              tooltip: 'This is simple tooltip',
            },
          },
          cons: {
            'ui:widget': 'TextArea',
            'ui:label': false,
          },
        },
        selectFields: {
          'ui:hideError': true,
          'ui:order': [
            'school',
            'conditionalSchool',
            'diplomas',
            'conditionalDiplomas',
            'years',
            'street',
            'city',
          ],
          school: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:placeholder': 'tu skus pisat',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              dropdownDivider: true,
              helptext: 'Here choose your last school',
              tooltip:
                'This tooltip will tell you what to do better when you choose this.',
            },
          },
          diplomas: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:options': {
              selectAllOption: true,
            },
          },
          years: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          street: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          city: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          conditionalSchool: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          conditionalDiplomas: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        chooseOneOf: {
          'ui:hideError': true,
          chooseOneOfMore: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
              radioOptions: [
                {
                  value: 'screen',
                  tooltip: 'Screen tooltip',
                },
                {
                  value: 'overlay',
                  tooltip: 'Overlay tooltip',
                },
              ],
            },
          },
          chooseOneOfTwo: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              variant: 'boxed',
              orientations: 'row',
              radioOptions: [
                {
                  value: 'screen',
                  tooltip: 'Screen tooltip',
                },
                {
                  value: 'overlay',
                  tooltip: 'Overlay tooltip',
                },
              ],
            },
          },
          overlayInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          notOverlayInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          againSchool: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
        },
        checkBoxes: {
          'ui:hideError': true,
          'ui:order': ['favouriteFruits', 'checkboxBonus'],
          favouriteFruits: {
            'ui:widget': 'Checkboxes',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              className: 'flex flex-col gap-3 w-fit',
              variant: 'boxed',
              checkboxOptions: [
                {
                  value: 'orange',
                  tooltip: 'Orange tooltip',
                },
                {
                  value: 'apple',
                  tooltip: 'Apple tooltip',
                },
              ],
            },
          },
          checkboxBonus: {
            'ui:order': ['firstBonus', 'secondBonus'],
            firstBonus: {
              'ui:widget': 'InputField',
              'ui:label': false,
            },
            secondBonus: {
              'ui:widget': 'InputField',
              'ui:label': false,
            },
            thirdLayer: {
              thirdBonus: {
                'ui:widget': 'InputField',
                'ui:label': false,
              },
            },
          },
        },
        conditionalStep: {
          randomInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        user: {
          'ui:hideError': true,
          'ui:order': ['phone'],
          phone: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Phone',
            'ui:options': {
              leftIcon: 'call',
            },
          },
        },
      },
      xmlTemplate: `<?xml version="1.0" encoding="utf-8"?>
    <E-form xmlns="http://schemas.gov.sk/doc/eform/form/0.1"
            xsi:schemaLocation="http://schemas.gov.sk/doc/eform/form/0.1"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <Meta>
        <ID>00603481.dopravneZnacenie.sk</ID>
        <Name>Dopravné značenie</Name>
        <Gestor></Gestor>
        <RecipientId></RecipientId>
        <Version>0.2</Version>
        <ZepRequired>false</ZepRequired>
        <EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid>
        <SenderID>mailto:hruska@example.com</SenderID>
      </Meta>
    </E-form>`,
    },
  })

  const schemaVersionNew = await prisma.schemaVersion.create({
    data: {
      version: 'v0.0.2',
      pospID: schemaVersion.pospID,
      pospVersion: schemaVersion.pospVersion,
      formDescription: schemaVersion.formDescription,
      schemaId: schema.id,
      data: schemaVersion.data as Prisma.InputJsonValue,
      dataXml: schemaVersion.dataXml,
      formFo: schemaVersion.formFo,
      jsonSchema: {
        pospID: 'test',
        pospVersion: '0.1',
        title: 'Example',
        description: 'Example schema',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              mestoPSCstep: {
                type: 'object',
                title: 'Mesto PSC step',
                properties: {
                  mestoPSC: {
                    required: ['psc', 'mesto'],
                    type: 'object',
                    properties: {
                      mesto: {
                        type: 'string',
                        title: 'Mesto',
                        default: 'Košice',
                      },
                      psc: {
                        type: 'string',
                        title: 'PSČ',
                        format: 'zip',
                      },
                    },
                  },
                },
                required: ['mestoPSC'],
              },
            },
            required: ['mestoPSCstep'],
          },
          {
            allOf: [
              {
                if: {
                  type: 'object',
                  properties: {
                    mestoPSCstep: {
                      type: 'object',
                      properties: {
                        mestoPSC: {
                          required: ['psc'],
                          type: 'object',
                          properties: {
                            psc: {
                              const: '82103',
                            },
                          },
                        },
                      },
                      required: ['mestoPSC'],
                    },
                  },
                  required: ['mestoPSCstep'],
                },
                then: {
                  type: 'object',
                  properties: {
                    conditionalStep: {
                      type: 'object',
                      title: 'Conditional step',
                      properties: {
                        randomInput: {
                          type: 'string',
                          title: 'Input in conditional step',
                        },
                      },
                    },
                  },
                  required: ['conditionalStep'],
                },
              },
            ],
          },
          {
            properties: {
              dateTimePickerShowcase: {
                type: 'object',
                properties: {
                  dateTimePicker: {
                    required: ['dateValue', 'timeValue'],
                    type: 'object',
                    properties: {
                      dateValue: {
                        type: 'string',
                        format: 'date',
                        title: 'Date',
                      },
                      timeValue: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time',
                      },
                    },
                  },
                },
                title: 'Showcase of DateTime Picker',
              },
            },
            required: ['dateTimePickerShowcase'],
          },
          {
            type: 'object',
            properties: {
              timeFromToShowcase: {
                title: 'Showcase of TimeFromTo Picker',
                type: 'object',
                properties: {
                  timeFromTo: {
                    timeFromTo: true,
                    type: 'object',
                    properties: {
                      startTime: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time From',
                      },
                      endTime: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time To',
                      },
                    },
                  },
                },
              },
            },
            required: ['timeFromToShowcase'],
          },
          {
            type: 'object',
            properties: {
              dateFromToShowcase: {
                title: 'Showcase of DateFromTo Picker',
                type: 'object',
                properties: {
                  dateFromTo: {
                    required: ['startDate', 'endDate'],
                    dateFromTo: true,
                    type: 'object',
                    properties: {
                      startDate: {
                        type: 'string',
                        format: 'date',
                        title: 'Date From',
                      },
                      endDate: {
                        type: 'string',
                        format: 'date',
                        title: 'Date To',
                      },
                    },
                  },
                },
              },
            },
            required: ['dateFromToShowcase'],
          },
          {
            type: 'object',
            properties: {
              datePickerWithTimePicker: {
                title: 'Showcase of DatePicker and TimePicker',
                type: 'object',
                properties: {
                  datePicker: {
                    title: 'Showcase of DatePicker',
                    required: [],
                    type: 'object',
                    properties: {
                      birth: {
                        type: 'string',
                        format: 'date',
                        title: 'Birth date',
                      },
                    },
                  },
                  timePicker: {
                    title: 'Showcase of TimePicker',
                    required: ['meeting-time'],
                    type: 'object',
                    properties: {
                      'meeting-time': {
                        type: 'string',
                        title: 'Meeting time',
                        format: 'localTime',
                      },
                    },
                  },
                },
              },
            },
            required: ['datePickerWithTimePicker'],
          },
          {
            type: 'object',
            properties: {
              inputFields: {
                title: 'Showcase of InputField',
                type: 'object',
                required: ['firstName', 'lastName'],
                properties: {
                  firstName: {
                    type: 'string',
                    title: 'First Name',
                    default: 'Anton',
                  },
                  lastName: {
                    type: 'string',
                    title: 'Last Name',
                    default: 'Peluha',
                  },
                  password: {
                    type: 'string',
                    title: 'Password',
                  },
                  psc: {
                    type: 'string',
                    title: 'PSC',
                    format: 'zip',
                  },
                  textAreas: {
                    title: 'Textove polia',
                    type: 'object',
                    required: ['pros'],
                    properties: {
                      pros: {
                        title: 'Pros',
                        type: 'string',
                      },
                      cons: {
                        title: 'Cons',
                        type: 'string',
                        default: 'Defaultna hodnota',
                      },
                    },
                  },
                },
              },
            },
            required: ['inputFields'],
          },
          {
            type: 'object',
            properties: {
              selectFields: {
                title: 'Ukazka Selectov',
                type: 'object',
                required: ['school'],
                properties: {
                  school: {
                    type: 'string',
                    title: 'University',
                    comment: 'Single choice select need to have default value',
                    default: 'stu_fei',
                    oneOf: [
                      {
                        const: 'stu_fei',
                        title: 'STU FEI',
                        description: 'fakulta elektrotechniky a informatiky',
                      },
                      {
                        const: 'stu_fchpt',
                        title: 'STU FCHPT',
                      },
                      {
                        const: 'stu_fiit',
                        title: 'STU FIIT',
                        description:
                          'fakulta informatiky a informacnych technologii',
                      },
                    ],
                  },
                  diplomas: {
                    type: 'array',
                    title: 'Reached diplomas',
                    uniqueItems: true,
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'stu_fei',
                          title: 'STU FEI',
                          description: 'fakulta elektrotechniky a informatiky',
                        },
                        {
                          const: 'stu_fchpt',
                          title: 'STU FCHPT',
                        },
                        {
                          const: 'stu_fiit',
                          title: 'STU FIIT',
                          description:
                            'fakulta informatiky a informacnych technologii',
                        },
                      ],
                    },
                  },
                  years: {
                    type: 'number',
                    title: 'Years in school',
                    oneOf: [
                      {
                        const: 1,
                      },
                      {
                        const: 2,
                      },
                      {
                        const: 3,
                      },
                    ],
                  },
                  street: {
                    type: 'string',
                    title: 'Street (ciselnik)',
                    format: 'ciselnik',
                    ciselnik: {
                      id: 'POST_STREET',
                    },
                  },
                  city: {
                    type: 'string',
                    title: 'City (ciselnik)',
                    format: 'ciselnik',
                    ciselnik: {
                      id: 'SUSR_0025',
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      type: 'object',
                      properties: {
                        school: {
                          const: 'stu_fchpt',
                        },
                      },
                    },
                    then: {
                      type: 'object',
                      properties: {
                        conditionalSchool: {
                          type: 'string',
                          title: 'Was fchpt good? (conditional field)',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            diplomas: {
                              const: ['stu_fei', 'stu_fiit'],
                            },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            diplomas: {
                              const: ['stu_fiit'],
                            },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            diplomas: {
                              const: ['stu_fei'],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      type: 'object',
                      properties: {
                        conditionalDiplomas: {
                          type: 'string',
                          title:
                            'How was your IT experience? (conditional field)',
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['selectFields'],
          },
          {
            type: 'object',
            properties: {
              fileUploads: {
                title: 'Nahratie suborov',
                type: 'object',
                required: ['importButtonMultipleFiles'],
                properties: {
                  importButtonOneFile: {
                    title: 'Importuj jeden subor',
                    type: 'string',
                    file: true,
                  },
                  importButtonMultipleFiles: {
                    title: 'Importuj viac suborov',
                    type: 'array',
                    items: {
                      type: 'string',
                      file: true,
                    },
                    default: [],
                    minItems: 1,
                  },
                  importDragAndDropOneFile: {
                    title: 'Presun sem jeden subor',
                    type: 'string',
                    file: true,
                  },
                  importDragAndDropMultipleFiles: {
                    title: 'Presun sem viac suborov',
                    type: 'array',
                    items: {
                      type: 'string',
                      file: true,
                    },
                  },
                  showConditionalFile: {
                    type: 'array',
                    title: 'Show conditional file',
                    minItems: 0,
                    maxItems: 1,
                    uniqueItems: true,
                    items: {
                      anyOf: [
                        {
                          title: 'Show',
                          const: 'show',
                        },
                      ],
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      type: 'object',
                      properties: {
                        showConditionalFile: {
                          type: 'array',
                          contains: {
                            type: 'string',
                            const: 'show',
                          },
                        },
                      },
                      required: ['showConditionalFile'],
                    },
                    then: {
                      type: 'object',
                      properties: {
                        conditionalFile: {
                          title: 'Presun sem jeden subor',
                          type: 'string',
                          file: true,
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['fileUploads'],
          },
          {
            type: 'object',
            properties: {
              chooseOneOf: {
                title: 'Radio button step',
                type: 'object',
                required: ['chooseOneOfMore'],
                properties: {
                  chooseOneOfMore: {
                    type: 'string',
                    title: 'Some random choose',
                    comment: 'Radio buttons need to have default value',
                    oneOf: [
                      {
                        const: 'screen',
                        title: 'Screen',
                      },
                      {
                        const: 'multiply',
                        title: 'Multiply',
                      },
                      {
                        const: 'overlay',
                        title: 'Overlay',
                      },
                    ],
                  },
                  chooseOneOfTwo: {
                    type: 'string',
                    title: 'Some random choose',
                    oneOf: [
                      {
                        const: 'Ano',
                        title: 'Ano',
                      },
                      {
                        const: 'Nie',
                        title: 'Nie',
                      },
                    ],
                  },
                },
                allOf: [
                  {
                    if: {
                      type: 'object',
                      properties: {
                        chooseOneOfMore: {
                          const: 'overlay',
                        },
                      },
                      required: ['chooseOneOfMore'],
                    },
                    then: {
                      required: ['overlayInput'],
                      type: 'object',
                      properties: {
                        overlayInput: {
                          type: 'string',
                          title: 'WRITE OVERLAY INPUT (conditional field)',
                        },
                      },
                    },
                    else: {
                      type: 'object',
                      properties: {
                        notOverlayInput: {
                          type: 'string',
                          title: 'some other input',
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['chooseOneOf'],
          },
          {
            type: 'object',
            properties: {
              checkBoxes: {
                title: 'Checkboxes',
                type: 'object',
                required: ['favouriteFruits'],
                properties: {
                  favouriteFruits: {
                    type: 'array',
                    title: 'Fruits max 3 items',
                    minItems: 1,
                    maxItems: 3,
                    uniqueItems: true,
                    items: {
                      anyOf: [
                        {
                          title: 'Orange',
                          const: 'orange',
                        },
                        {
                          title: 'Banana',
                          const: 'banana',
                        },
                        {
                          title: 'Grape',
                          const: 'grape',
                        },
                        {
                          title: 'Kiwi',
                          const: 'kiwi',
                        },
                        {
                          title: 'Apple',
                          const: 'apple',
                        },
                        {
                          title: 'Plum',
                          const: 'plum',
                        },
                      ],
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            favouriteFruits: {
                              const: ['plum'],
                            },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            favouriteFruits: {
                              const: ['apple'],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      type: 'object',
                      properties: {
                        checkboxBonus: {
                          title: 'This will show when we will click plum',
                          type: 'object',
                          required: ['firstBonus'],
                          properties: {
                            firstBonus: {
                              type: 'string',
                              title: 'First bonus (conditional field)',
                            },
                            secondBonus: {
                              type: 'string',
                              title: 'Second bonus (conditional field)',
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['checkBoxes'],
          },
        ],
      },
      uiSchema: {
        mestoPSCstep: {
          mestoPSC: {
            'ui:options': {
              objectDisplay: 'columns',
              objectColumnRatio: '3/1',
            },
            mesto: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:placeholder': 'placeholder text',
              'ui:options': {
                tooltip: 'Mesto tooltip',
                required: true,
                resetIcon: true,
                leftIcon: 'person',
                explicitOptional: true,
                spaceTop: 'large',
                size: 'large',
              },
            },
            psc: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
          },
        },
        dateTimePickerShowcase: {
          dateTimePicker: {
            'ui:field': 'dateTime',
            'ui:hideError': true,
            'ui:options': {
              TimeTooltip: 'Time tooltip',
              DateTooltip: 'Time tooltip',
              DateDescription: 'From desc',
            },
          },
        },
        timeFromToShowcase: {
          timeFromTo: {
            'ui:field': 'timeFromTo',
            'ui:hideError': true,
            'ui:options': {
              TimeFromTooltip: 'Time tooltip',
              TimeToTooltip: 'Time tooltip',
              TimeFromDescription: 'From desc',
              TimeToDescription: 'To desc',
            },
          },
        },
        dateFromToShowcase: {
          dateFromTo: {
            'ui:hideError': true,
            'ui:field': 'dateFromTo',
            'ui:options': {
              DateFromTooltip: 'From tooltip',
              DateToTooltip: 'To tooltip',
              DateFromDescription: 'From desc',
              DateToDescription: 'To desc',
            },
          },
        },
        datePickerWithTimePicker: {
          datePicker: {
            'ui:hideError': true,
            birth: {
              'ui:widget': 'DatePicker',
              'ui:label': false,
              'ui:options': {
                tooltip: 'Date picker hint',
              },
            },
          },
          timePicker: {
            'ui:hideError': true,
            'meeting-time': {
              'ui:widget': 'TimePicker',
              'ui:label': false,
              'ui:options': {
                tooltip: 'Time picker hint',
              },
            },
          },
        },
        inputFields: {
          'ui:hideError': true,
          firstName: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'First Name',
            'ui:accordion': {
              title: 'Header name',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              tooltip: 'First name hint',
              resetIcon: true,
              leftIcon: 'person',
              size: 'large',
              spaceTop: 'large',
            },
          },
          lastName: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Last Name',
            'ui:accordion': {
              title: 'Header name',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              tooltip: 'Last name hint',
              resetIcon: true,
              leftIcon: 'person',
              size: 'default',
            },
          },
          phone: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Phone',
            'ui:options': {
              tooltip: 'Phone hint',
              resetIcon: true,
              leftIcon: 'call',
              size: 'default',
              explicitOptional: true,
            },
          },
          password: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Password',
            'ui:options': {
              tooltip: 'Password hint',
              leftIcon: 'lock',
              type: 'password',
              explicitOptional: true,
            },
          },
          psc: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'PSC',
            'ui:options': {
              tooltip: 'PSC hint, only numbers',
              helptext: 'Only numbers',
              size: 'small',
            },
          },
          textAreas: {
            'ui:order': ['pros', 'cons'],
            pros: {
              'ui:widget': 'TextArea',
              'ui:label': false,
              'ui:placeholder': 'Write some cons please',
              'ui:options': {
                description: 'Here write pros',
                tooltip: 'This is simple tooltip',
              },
            },
            cons: {
              'ui:widget': 'TextArea',
              'ui:label': false,
            },
          },
        },
        fileUploads: {
          'ui:hideError': true,
          'ui:order': [
            'importButtonOneFile',
            'importButtonMultipleFiles',
            'importDragAndDropOneFile',
            'importDragAndDropMultipleFiles',
            'showConditionalFile',
            'conditionalFile',
          ],
          importButtonOneFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              type: 'button',
              helptext:
                'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.\nPrílohy nemôžu presiahnuť veľkosť 250MB.',
            },
          },
          importButtonMultipleFiles: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
          importDragAndDropOneFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'dragAndDrop',
            },
          },
          importDragAndDropMultipleFiles: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              type: 'dragAndDrop',
            },
          },
          showConditionalFile: {
            'ui:widget': 'Checkboxes',
            'ui:options': {
              variant: 'boxed',
              checkboxOptions: [
                {
                  value: 'show',
                  tooltip: 'Show conditional file',
                },
              ],
            },
          },
          conditionalFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              type: 'dragAndDrop',
            },
          },
        },
        textAreas: {
          'ui:hideError': true,
          pros: {
            'ui:widget': 'TextArea',
            'ui:label': false,
            'ui:placeholder': 'Write some cons please',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              helptext: 'Here write pros',
              tooltip: 'This is simple tooltip',
            },
          },
          cons: {
            'ui:widget': 'TextArea',
            'ui:label': false,
          },
        },
        selectFields: {
          'ui:hideError': true,
          'ui:order': [
            'school',
            'conditionalSchool',
            'diplomas',
            'conditionalDiplomas',
            'years',
            'street',
            'city',
          ],
          school: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:placeholder': 'tu skus pisat',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              dropdownDivider: true,
              helptext: 'Here choose your last school',
              tooltip:
                'This tooltip will tell you what to do better when you choose this.',
            },
          },
          diplomas: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:options': {
              selectAllOption: true,
            },
          },
          years: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          street: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          city: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          conditionalSchool: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          conditionalDiplomas: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        chooseOneOf: {
          'ui:hideError': true,
          chooseOneOfMore: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
              radioOptions: [
                {
                  value: 'screen',
                  tooltip: 'Screen tooltip',
                },
                {
                  value: 'overlay',
                  tooltip: 'Overlay tooltip',
                },
              ],
            },
          },
          chooseOneOfTwo: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              variant: 'boxed',
              orientations: 'row',
              radioOptions: [
                {
                  value: 'screen',
                  tooltip: 'Screen tooltip',
                },
                {
                  value: 'overlay',
                  tooltip: 'Overlay tooltip',
                },
              ],
            },
          },
          overlayInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          notOverlayInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          againSchool: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
        },
        checkBoxes: {
          'ui:hideError': true,
          'ui:order': ['favouriteFruits', 'checkboxBonus'],
          favouriteFruits: {
            'ui:widget': 'Checkboxes',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              className: 'flex flex-col gap-3 w-fit',
              variant: 'boxed',
              checkboxOptions: [
                {
                  value: 'orange',
                  tooltip: 'Orange tooltip',
                },
                {
                  value: 'apple',
                  tooltip: 'Apple tooltip',
                },
              ],
            },
          },
          checkboxBonus: {
            'ui:order': ['firstBonus', 'secondBonus'],
            firstBonus: {
              'ui:widget': 'InputField',
              'ui:label': false,
            },
            secondBonus: {
              'ui:widget': 'InputField',
              'ui:label': false,
            },
            thirdLayer: {
              thirdBonus: {
                'ui:widget': 'InputField',
                'ui:label': false,
              },
            },
          },
        },
        conditionalStep: {
          randomInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        user: {
          'ui:hideError': true,
          'ui:order': ['phone'],
          phone: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Phone',
            'ui:options': {
              leftIcon: 'call',
            },
          },
        },
      },
      xmlTemplate: schemaVersion.xmlTemplate,
    },
  })

  const schemaVersionv3 = await prisma.schemaVersion.create({
    data: {
      version: 'v0.0.3',
      pospID: schemaVersion.pospID,
      pospVersion: schemaVersion.pospVersion,
      formDescription: schemaVersion.formDescription,
      schemaId: schema.id,
      data: schemaVersion.data as Prisma.InputJsonValue,
      dataXml: schemaVersion.dataXml,
      formFo: schemaVersion.formFo,
      jsonSchema: {
        pospID: 'test',
        pospVersion: '0.1',
        title: 'Example',
        description: 'Example schema',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              mestoPSCstep: {
                type: 'object',
                title: 'Mesto PSC step',
                hash: 'mesto-psc-step',
                properties: {
                  mestoPSC: {
                    required: ['psc', 'mesto'],
                    type: 'object',
                    properties: {
                      mesto: {
                        type: 'string',
                        title: 'Mesto',
                        default: 'Košice',
                      },
                      psc: {
                        type: 'string',
                        title: 'PSČ',
                        format: 'zip',
                      },
                    },
                  },
                },
                required: ['mestoPSC'],
              },
            },
            required: ['mestoPSCstep'],
          },
          {
            allOf: [
              {
                if: {
                  type: 'object',
                  properties: {
                    mestoPSCstep: {
                      type: 'object',
                      properties: {
                        mestoPSC: {
                          required: ['psc'],
                          type: 'object',
                          properties: {
                            psc: {
                              const: '82103',
                            },
                          },
                        },
                      },
                      required: ['mestoPSC'],
                    },
                  },
                  required: ['mestoPSCstep'],
                },
                then: {
                  type: 'object',
                  properties: {
                    conditionalStep: {
                      type: 'object',
                      title: 'Conditional step',
                      hash: 'conditional-step',
                      properties: {
                        randomInput: {
                          type: 'string',
                          title: 'Input in conditional step',
                        },
                      },
                    },
                  },
                  required: ['conditionalStep'],
                },
              },
            ],
          },
          {
            properties: {
              dateTimePickerShowcase: {
                type: 'object',
                properties: {
                  dateTimePicker: {
                    required: ['dateValue', 'timeValue'],
                    type: 'object',
                    properties: {
                      dateValue: {
                        type: 'string',
                        format: 'date',
                        title: 'Date',
                      },
                      timeValue: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time',
                      },
                    },
                  },
                },
                title: 'Showcase of DateTime Picker',
                hash: 'showcase-of-datetime-picker',
              },
            },
            required: ['dateTimePickerShowcase'],
          },
          {
            type: 'object',
            properties: {
              timeFromToShowcase: {
                title: 'Showcase of TimeFromTo Picker',
                hash: 'showcase-of-timefromto-picker',
                type: 'object',
                properties: {
                  timeFromTo: {
                    timeFromTo: true,
                    type: 'object',
                    properties: {
                      startTime: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time From',
                      },
                      endTime: {
                        type: 'string',
                        format: 'localTime',
                        title: 'Time To',
                      },
                    },
                  },
                },
              },
            },
            required: ['timeFromToShowcase'],
          },
          {
            type: 'object',
            properties: {
              dateFromToShowcase: {
                title: 'Showcase of DateFromTo Picker',
                hash: 'showcase-of-datefromto-picker',
                type: 'object',
                properties: {
                  dateFromTo: {
                    required: ['startDate', 'endDate'],
                    dateFromTo: true,
                    type: 'object',
                    properties: {
                      startDate: {
                        type: 'string',
                        format: 'date',
                        title: 'Date From',
                      },
                      endDate: {
                        type: 'string',
                        format: 'date',
                        title: 'Date To',
                      },
                    },
                  },
                },
              },
            },
            required: ['dateFromToShowcase'],
          },
          {
            type: 'object',
            properties: {
              datePickerWithTimePicker: {
                title: 'Showcase of DatePicker and TimePicker',
                hash: 'showcase-of-datepicker-and-timepicker',
                type: 'object',
                properties: {
                  datePicker: {
                    title: 'Showcase of DatePicker',
                    required: [],
                    type: 'object',
                    properties: {
                      birth: {
                        type: 'string',
                        format: 'date',
                        title: 'Birth date',
                      },
                    },
                  },
                  timePicker: {
                    title: 'Showcase of TimePicker',
                    required: ['meeting-time'],
                    type: 'object',
                    properties: {
                      'meeting-time': {
                        type: 'string',
                        title: 'Meeting time',
                        format: 'localTime',
                      },
                    },
                  },
                },
              },
            },
            required: ['datePickerWithTimePicker'],
          },
          {
            type: 'object',
            properties: {
              inputFields: {
                title: 'Showcase of InputField',
                hash: 'showcase-of-inputfield',
                type: 'object',
                required: ['firstName', 'lastName'],
                properties: {
                  firstName: {
                    type: 'string',
                    title: 'First Name',
                    default: 'Anton',
                  },
                  lastName: {
                    type: 'string',
                    title: 'Last Name',
                    default: 'Peluha',
                  },
                  password: {
                    type: 'string',
                    title: 'Password',
                  },
                  psc: {
                    type: 'string',
                    title: 'PSC',
                    format: 'zip',
                  },
                  textAreas: {
                    title: 'Textove polia',
                    type: 'object',
                    required: ['pros'],
                    properties: {
                      pros: {
                        title: 'Pros',
                        type: 'string',
                      },
                      cons: {
                        title: 'Cons',
                        type: 'string',
                        default: 'Defaultna hodnota',
                      },
                    },
                  },
                },
              },
            },
            required: ['inputFields'],
          },
          {
            type: 'object',
            properties: {
              selectFields: {
                title: 'Ukazka Selectov',
                hash: 'ukazka-selectov',
                type: 'object',
                required: ['school'],
                properties: {
                  school: {
                    type: 'string',
                    title: 'University',
                    comment: 'Single choice select need to have default value',
                    default: 'stu_fei',
                    oneOf: [
                      {
                        const: 'stu_fei',
                        title: 'STU FEI',
                        description: 'fakulta elektrotechniky a informatiky',
                      },
                      {
                        const: 'stu_fchpt',
                        title: 'STU FCHPT',
                      },
                      {
                        const: 'stu_fiit',
                        title: 'STU FIIT',
                        description:
                          'fakulta informatiky a informacnych technologii',
                      },
                    ],
                  },
                  diplomas: {
                    type: 'array',
                    title: 'Reached diplomas',
                    uniqueItems: true,
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'stu_fei',
                          title: 'STU FEI',
                          description: 'fakulta elektrotechniky a informatiky',
                        },
                        {
                          const: 'stu_fchpt',
                          title: 'STU FCHPT',
                        },
                        {
                          const: 'stu_fiit',
                          title: 'STU FIIT',
                          description:
                            'fakulta informatiky a informacnych technologii',
                        },
                      ],
                    },
                  },
                  years: {
                    type: 'number',
                    title: 'Years in school',
                    oneOf: [
                      {
                        const: 1,
                      },
                      {
                        const: 2,
                      },
                      {
                        const: 3,
                      },
                    ],
                  },
                  street: {
                    type: 'string',
                    title: 'Street (ciselnik)',
                    format: 'ciselnik',
                    ciselnik: {
                      id: 'POST_STREET',
                    },
                  },
                  city: {
                    type: 'string',
                    title: 'City (ciselnik)',
                    format: 'ciselnik',
                    ciselnik: {
                      id: 'SUSR_0025',
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      type: 'object',
                      properties: {
                        school: {
                          const: 'stu_fchpt',
                        },
                      },
                    },
                    then: {
                      type: 'object',
                      properties: {
                        conditionalSchool: {
                          type: 'string',
                          title: 'Was fchpt good? (conditional field)',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            diplomas: {
                              const: ['stu_fei', 'stu_fiit'],
                            },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            diplomas: {
                              const: ['stu_fiit'],
                            },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            diplomas: {
                              const: ['stu_fei'],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      type: 'object',
                      properties: {
                        conditionalDiplomas: {
                          type: 'string',
                          title:
                            'How was your IT experience? (conditional field)',
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['selectFields'],
          },
          {
            type: 'object',
            properties: {
              fileUploads: {
                title: 'Nahratie suborov',
                hash: 'nahratie-suborov',
                type: 'object',
                required: ['importButtonMultipleFiles'],
                properties: {
                  importButtonOneFile: {
                    title: 'Importuj jeden subor',
                    type: 'string',
                    file: true,
                  },
                  importButtonMultipleFiles: {
                    title: 'Importuj viac suborov',
                    type: 'array',
                    items: {
                      type: 'string',
                      file: true,
                    },
                    default: [],
                    minItems: 1,
                  },
                  importDragAndDropOneFile: {
                    title: 'Presun sem jeden subor',
                    type: 'string',
                    file: true,
                  },
                  importDragAndDropMultipleFiles: {
                    title: 'Presun sem viac suborov',
                    type: 'array',
                    items: {
                      type: 'string',
                      file: true,
                    },
                  },
                  showConditionalFile: {
                    type: 'array',
                    title: 'Show conditional file',
                    minItems: 0,
                    maxItems: 1,
                    uniqueItems: true,
                    items: {
                      anyOf: [
                        {
                          title: 'Show',
                          const: 'show',
                        },
                      ],
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      type: 'object',
                      properties: {
                        showConditionalFile: {
                          type: 'array',
                          contains: {
                            type: 'string',
                            const: 'show',
                          },
                        },
                      },
                      required: ['showConditionalFile'],
                    },
                    then: {
                      type: 'object',
                      properties: {
                        conditionalFile: {
                          title: 'Presun sem jeden subor',
                          type: 'string',
                          file: true,
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['fileUploads'],
          },
          {
            type: 'object',
            properties: {
              chooseOneOf: {
                title: 'Radio button step',
                hash: 'radio-button-step',
                type: 'object',
                required: ['chooseOneOfMore'],
                properties: {
                  chooseOneOfMore: {
                    type: 'string',
                    title: 'Some random choose',
                    comment: 'Radio buttons need to have default value',
                    oneOf: [
                      {
                        const: 'screen',
                        title: 'Screen',
                      },
                      {
                        const: 'multiply',
                        title: 'Multiply',
                      },
                      {
                        const: 'overlay',
                        title: 'Overlay',
                      },
                    ],
                  },
                  chooseOneOfTwo: {
                    type: 'string',
                    title: 'Some random choose',
                    oneOf: [
                      {
                        const: 'Ano',
                        title: 'Ano',
                      },
                      {
                        const: 'Nie',
                        title: 'Nie',
                      },
                    ],
                  },
                },
                allOf: [
                  {
                    if: {
                      type: 'object',
                      properties: {
                        chooseOneOfMore: {
                          const: 'overlay',
                        },
                      },
                      required: ['chooseOneOfMore'],
                    },
                    then: {
                      required: ['overlayInput'],
                      type: 'object',
                      properties: {
                        overlayInput: {
                          type: 'string',
                          title: 'WRITE OVERLAY INPUT (conditional field)',
                        },
                      },
                    },
                    else: {
                      type: 'object',
                      properties: {
                        notOverlayInput: {
                          type: 'string',
                          title: 'some other input',
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['chooseOneOf'],
          },
          {
            type: 'object',
            properties: {
              checkBoxes: {
                title: 'Checkboxes',
                hash: 'checkboxes',
                type: 'object',
                required: ['favouriteFruits'],
                properties: {
                  favouriteFruits: {
                    type: 'array',
                    title: 'Fruits max 3 items',
                    minItems: 1,
                    maxItems: 3,
                    uniqueItems: true,
                    items: {
                      anyOf: [
                        {
                          title: 'Orange',
                          const: 'orange',
                        },
                        {
                          title: 'Banana',
                          const: 'banana',
                        },
                        {
                          title: 'Grape',
                          const: 'grape',
                        },
                        {
                          title: 'Kiwi',
                          const: 'kiwi',
                        },
                        {
                          title: 'Apple',
                          const: 'apple',
                        },
                        {
                          title: 'Plum',
                          const: 'plum',
                        },
                      ],
                    },
                  },
                },
                allOf: [
                  {
                    if: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            favouriteFruits: {
                              const: ['plum'],
                            },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            favouriteFruits: {
                              const: ['apple'],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      type: 'object',
                      properties: {
                        checkboxBonus: {
                          title: 'This will show when we will click plum',
                          type: 'object',
                          required: ['firstBonus'],
                          properties: {
                            firstBonus: {
                              type: 'string',
                              title: 'First bonus (conditional field)',
                            },
                            secondBonus: {
                              type: 'string',
                              title: 'Second bonus (conditional field)',
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            required: ['checkBoxes'],
          },
        ],
      },
      uiSchema: {
        mestoPSCstep: {
          mestoPSC: {
            'ui:options': {
              objectDisplay: 'columns',
              objectColumnRatio: '3/1',
            },
            'ui:order': ['mesto', 'psc'],
            mesto: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:placeholder': 'placeholder text',
              'ui:options': {
                tooltip: 'Mesto tooltip',
                required: true,
                resetIcon: true,
                leftIcon: 'person',
                explicitOptional: true,
                spaceTop: 'large',
                size: 'large',
              },
            },
            psc: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
          },
        },
        dateTimePickerShowcase: {
          dateTimePicker: {
            'ui:field': 'dateTime',
            'ui:hideError': true,
            'ui:options': {
              TimeTooltip: 'Time tooltip',
              DateTooltip: 'Time tooltip',
              DateDescription: 'From desc',
            },
          },
        },
        timeFromToShowcase: {
          timeFromTo: {
            'ui:field': 'timeFromTo',
            'ui:hideError': true,
            'ui:options': {
              TimeFromTooltip: 'Time tooltip',
              TimeToTooltip: 'Time tooltip',
              TimeFromDescription: 'From desc',
              TimeToDescription: 'To desc',
            },
          },
        },
        dateFromToShowcase: {
          dateFromTo: {
            'ui:hideError': true,
            'ui:field': 'dateFromTo',
            'ui:options': {
              DateFromTooltip: 'From tooltip',
              DateToTooltip: 'To tooltip',
              DateFromDescription: 'From desc',
              DateToDescription: 'To desc',
            },
          },
        },
        datePickerWithTimePicker: {
          datePicker: {
            'ui:hideError': true,
            birth: {
              'ui:widget': 'DatePicker',
              'ui:label': false,
              'ui:options': {
                tooltip: 'Date picker hint',
              },
            },
          },
          timePicker: {
            'ui:hideError': true,
            'meeting-time': {
              'ui:widget': 'TimePicker',
              'ui:label': false,
              'ui:options': {
                tooltip: 'Time picker hint',
              },
            },
          },
        },
        inputFields: {
          'ui:hideError': true,
          firstName: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'First Name',
            'ui:accordion': {
              title: 'Header name',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              tooltip: 'First name hint',
              resetIcon: true,
              leftIcon: 'person',
              size: 'large',
              spaceTop: 'large',
            },
          },
          lastName: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Last Name',
            'ui:accordion': {
              title: 'Header name',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              tooltip: 'Last name hint',
              resetIcon: true,
              leftIcon: 'person',
              size: 'default',
            },
          },
          phone: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Phone',
            'ui:options': {
              tooltip: 'Phone hint',
              resetIcon: true,
              leftIcon: 'call',
              size: 'default',
              explicitOptional: true,
            },
          },
          password: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Password',
            'ui:options': {
              tooltip: 'Password hint',
              leftIcon: 'lock',
              type: 'password',
              explicitOptional: true,
            },
          },
          psc: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'PSC',
            'ui:options': {
              tooltip: 'PSC hint, only numbers',
              helptext: 'Only numbers',
              size: 'small',
            },
          },
          textAreas: {
            'ui:order': ['pros', 'cons'],
            pros: {
              'ui:widget': 'TextArea',
              'ui:label': false,
              'ui:placeholder': 'Write some cons please',
              'ui:options': {
                description: 'Here write pros',
                tooltip: 'This is simple tooltip',
              },
            },
            cons: {
              'ui:widget': 'TextArea',
              'ui:label': false,
            },
          },
        },
        fileUploads: {
          'ui:hideError': true,
          'ui:order': [
            'importButtonOneFile',
            'importButtonMultipleFiles',
            'importDragAndDropOneFile',
            'importDragAndDropMultipleFiles',
            'showConditionalFile',
            'conditionalFile',
          ],
          importButtonOneFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              type: 'button',
              helptext:
                'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.\nPrílohy nemôžu presiahnuť veľkosť 250MB.',
            },
          },
          importButtonMultipleFiles: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
          importDragAndDropOneFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'dragAndDrop',
            },
          },
          importDragAndDropMultipleFiles: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              type: 'dragAndDrop',
            },
          },
          showConditionalFile: {
            'ui:widget': 'Checkboxes',
            'ui:options': {
              variant: 'boxed',
              checkboxOptions: [
                {
                  value: 'show',
                  tooltip: 'Show conditional file',
                },
              ],
            },
          },
          conditionalFile: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              type: 'dragAndDrop',
            },
          },
        },
        textAreas: {
          'ui:hideError': true,
          pros: {
            'ui:widget': 'TextArea',
            'ui:label': false,
            'ui:placeholder': 'Write some cons please',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              helptext: 'Here write pros',
              tooltip: 'This is simple tooltip',
            },
          },
          cons: {
            'ui:widget': 'TextArea',
            'ui:label': false,
          },
        },
        selectFields: {
          'ui:hideError': true,
          'ui:order': [
            'school',
            'conditionalSchool',
            'diplomas',
            'conditionalDiplomas',
            'years',
            'street',
            'city',
          ],
          school: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:placeholder': 'tu skus pisat',
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              dropdownDivider: true,
              helptext: 'Here choose your last school',
              tooltip:
                'This tooltip will tell you what to do better when you choose this.',
            },
          },
          diplomas: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:options': {
              selectAllOption: true,
            },
          },
          years: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          street: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          city: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
          conditionalSchool: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          conditionalDiplomas: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        chooseOneOf: {
          'ui:hideError': true,
          chooseOneOfMore: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
              radioOptions: [
                {
                  value: 'screen',
                  tooltip: 'Screen tooltip',
                },
                {
                  value: 'overlay',
                  tooltip: 'Overlay tooltip',
                },
              ],
            },
          },
          chooseOneOfTwo: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              variant: 'boxed',
              orientations: 'row',
              radioOptions: [
                {
                  value: 'screen',
                  tooltip: 'Screen tooltip',
                },
                {
                  value: 'overlay',
                  tooltip: 'Overlay tooltip',
                },
              ],
            },
          },
          overlayInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          notOverlayInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          againSchool: {
            'ui:widget': 'SelectField',
            'ui:label': false,
          },
        },
        checkBoxes: {
          'ui:hideError': true,
          'ui:order': ['favouriteFruits', 'checkboxBonus'],
          favouriteFruits: {
            'ui:widget': 'Checkboxes',
            'ui:label': false,
            'ui:accordion': {
              title: 'Header name',
              size: 'sm',
              content:
                "<div class='flex items-center'>\n\n### h3\n&nbsp; &nbsp;\n::tooltip[Tooltip text]\n\n</div>\n\n#### h4\n##### h5\n###### h6",
            },
            'ui:options': {
              className: 'flex flex-col gap-3 w-fit',
              variant: 'boxed',
              checkboxOptions: [
                {
                  value: 'orange',
                  tooltip: 'Orange tooltip',
                },
                {
                  value: 'apple',
                  tooltip: 'Apple tooltip',
                },
              ],
            },
          },
          checkboxBonus: {
            'ui:order': ['firstBonus', 'secondBonus'],
            firstBonus: {
              'ui:widget': 'InputField',
              'ui:label': false,
            },
            secondBonus: {
              'ui:widget': 'InputField',
              'ui:label': false,
            },
            thirdLayer: {
              thirdBonus: {
                'ui:widget': 'InputField',
                'ui:label': false,
              },
            },
          },
        },
        conditionalStep: {
          randomInput: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        user: {
          'ui:hideError': true,
          'ui:order': ['phone'],
          phone: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:placeholder': 'Phone',
            'ui:options': {
              leftIcon: 'call',
            },
          },
        },
      },
      xmlTemplate: schemaVersion.xmlTemplate,
    },
  })

  const zavazneStanoviskoSchema = await prisma.schema.create({
    data: {
      formName: 'Záväzné stanovisko k investičnej činnosti',
      slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
      category: null,
      messageSubject: 'Podanie',
    },
  })

  await prisma.schemaVersion.create({
    data: {
      version: 'v0.0.1',
      pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
      pospVersion: '0.1',
      schemaId: zavazneStanoviskoSchema.id,
      data: zavazneStanovisko.data,
      dataXml: `<?xml version="1.0" encoding="utf-8"?>
      <!-- Created with Liquid Technologies Online Tools 1.0 (https://www.liquid-technologies.com) -->
      <E-form xmlns="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1" xsi:schemaLocation="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1 schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Meta>
          <ID>string</ID>
          <Name>string</Name>
          <Description>string</Description>
          <Gestor>string</Gestor>
          <RecipientId>string</RecipientId>
          <Version>string</Version>
          <ZepRequired>0</ZepRequired>
          <EformUuid>string</EformUuid>
          <SenderID>mailto:</SenderID>
        </Meta>
        <Body>
          <Ziadatel>
            <ZiatetelTyp>Právnicka osoba</ZiatetelTyp>
            <ZiadatelObchodneMeno>string</ZiadatelObchodneMeno>
            <ZiadatelIco>966</ZiadatelIco>
            <ZiadatelAdresaPobytu>string</ZiadatelAdresaPobytu>
            <ZiadatelMiestoPodnikania>string</ZiadatelMiestoPodnikania>
            <ZiadatelMesto>
              <Code>string</Code>
              <Name>string</Name>
              <WsEnumCode>string</WsEnumCode>
            </ZiadatelMesto>
            <ZiadatelPsc>string</ZiadatelPsc>
            <ZiadatelTelefon>+5</ZiadatelTelefon>
          </Ziadatel>
          <Investor>
            <InvestorZiadatelom>false</InvestorZiadatelom>
            <Splnomocnenie>
              <Nazov>string</Nazov>
              <Prilozena>false</Prilozena>
            </Splnomocnenie>
            <Splnomocnenie>
              <Nazov>string</Nazov>
              <Prilozena>false</Prilozena>
            </Splnomocnenie>
            <InvestorTyp>Fyzická osoba - podnikateľ</InvestorTyp>
            <InvestorAdresaSidla>string</InvestorAdresaSidla>
            <InvestorMesto>
              <Code>string</Code>
              <Name>string</Name>
              <WsEnumCode>string</WsEnumCode>
            </InvestorMesto>
            <InvestorPsc>string</InvestorPsc>
            <InvestorKontaktnaOsoba>string</InvestorKontaktnaOsoba>
            <InvestorTelefon>004</InvestorTelefon>
          </Investor>
          <Projektant>
            <ProjektantMenoPriezvisko>8C </ProjektantMenoPriezvisko>
            <ProjektantEmail>string</ProjektantEmail>
            <ProjektantTelefon>00393</ProjektantTelefon>
            <AutorizacneOsvedcenie>string</AutorizacneOsvedcenie>
            <DatumSpracovania>1987-03-17</DatumSpracovania>
          </Projektant>
          <Stavba>
            <StavbaNazov>string</StavbaNazov>
            <StavbaDruh>Rodinný dom</StavbaDruh>
            <StavbaUlica>string</StavbaUlica>
            <StavbaParcela>string</StavbaParcela>
            <StavbaKataster>string</StavbaKataster>
            <StavbaKataster>string</StavbaKataster>
          </Stavba>
          <Konanie>
            <KonanieTyp>Územné konanie</KonanieTyp>
            <StavbaFotodokumentacia>
              <Nazov>string</Nazov>
              <Prilozena>true</Prilozena>
            </StavbaFotodokumentacia>
            <StavbaPisomnosti>
              <Nazov>string</Nazov>
              <Prilozena>1</Prilozena>
            </StavbaPisomnosti>
          </Konanie>
          <Prilohy>
            <ProjektovaDokumentacia>
              <Nazov>string</Nazov>
              <Prilozena>true</Prilozena>
            </ProjektovaDokumentacia>
            <ProjektovaDokumentacia>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </ProjektovaDokumentacia>
            <ProjektovaDokumentacia>
              <Nazov>string</Nazov>
              <Prilozena>true</Prilozena>
            </ProjektovaDokumentacia>
            <ProjektovaDokumentacia>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </ProjektovaDokumentacia>
            <Vykresy>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </Vykresy>
            <Vykresy>
              <Nazov>string</Nazov>
              <Prilozena>false</Prilozena>
            </Vykresy>
            <UlicnyPohlad>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </UlicnyPohlad>
            <UlicnyPohlad>
              <Nazov>string</Nazov>
              <Prilozena>1</Prilozena>
            </UlicnyPohlad>
            <UlicnyPohlad>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </UlicnyPohlad>
            <PodzemnePodlazie>
              <Nazov>string</Nazov>
              <Prilozena>true</Prilozena>
            </PodzemnePodlazie>
            <PodzemnePodlazie>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </PodzemnePodlazie>
            <PodzemnePodlazie>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </PodzemnePodlazie>
            <VyjadrenieUradu>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </VyjadrenieUradu>
            <VyjadrenieUradu>
              <Nazov>string</Nazov>
              <Prilozena>1</Prilozena>
            </VyjadrenieUradu>
            <VyjadrenieUradu>
              <Nazov>string</Nazov>
              <Prilozena>true</Prilozena>
            </VyjadrenieUradu>
            <VyjadrenieUradu>
              <Nazov>string</Nazov>
              <Prilozena>0</Prilozena>
            </VyjadrenieUradu>
          </Prilohy>
        </Body>
      </E-form>`,
      formFo: zavazneStanovisko.pdfStylesheet ?? '',
      jsonSchema: zavazneStanovisko.schema,
      uiSchema: zavazneStanovisko.uiSchema,
      xmlTemplate: zavazneStanovisko.xmlTemplate,
    },
  })

  const zavazneStanoviskoSchemaVersionNew = await prisma.schemaVersion.create({
    data: {
      version: 'v0.0.2',
      pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
      pospVersion: '0.1',
      schemaId: zavazneStanoviskoSchema.id,
      data: {
        prilohy: {
          projektovaDokumentacia: [
            'ut et dolore dolore',
            'anim',
            'Ut',
            'qui ipsum eu ex',
          ],
        },
        ziadatel: {
          ziadatelTyp: 'Fyzická osoba - podnikateľ',
          ziadatelMestoPsc: {
            ziadatelMesto: 'dhRpRl',
            ziadatelPsc: 'in ex est ut Duis',
          },
          ziadatelEmail: 'HU1JNstMKagVVz@QmAnEHHaadFBmbDNNNEZuQytWjXsG.eugv',
          ziadatelTelefon: '0070704340971',
          ziadatelMenoPriezvisko: "<;Wk1!Z =6C'n$D6`_",
          ziadatelObchodneMeno: 'veniam adipisicing sunt',
          ziadatelAdresaPobytu: 'consectetur',
        },
        investor: {
          investorZiadatelom: false,
          investorMenoPriezvisko: "+Iu#'P 3K9Kq ",
          investorTelefon: '002',
          investorAdresaPobytu: 'esse mollit eu nisi commodo',
          investorTyp: 'Fyzická osoba - podnikateľ',
          investorAdresaSidla: 'non dolor nostrud est consequat',
          investorMestoPsc: {
            investorMesto: 'URtVJEeMB',
            investorPsc: 'veniam non',
          },
          investorMiestoPodnikania: 'reprehenderit Ut sint ut ullamco',
          splnomocnenie: ['et'],
          investorIco: 49_254_866.146_330_03,
          investorObchodneMeno: 'magna',
          investorEmail: '5tbSrzvt3YiZL@Uh.cqf',
          investorKontaktnaOsoba: 'fugiat Ut dolor eu',
        },
        projektant: {
          projektantMenoPriezvisko: 'CA& <yX8',
          projektantEmail: 'YWIJHYnN@ZZc.vyz',
          projektantTelefon: '0053244',
          autorizacneOsvedcenie: 'sit aliqua elit eiusmod commodo',
          datumSpracovania: '1978-11-14',
        },
        stavba: {
          stavbaNazov: 'dolore nisi deserunt elit',
          stavbaDruh: 'Iné',
          stavbaUlica: 'minim ad consequat incididunt',
          stavbaParcela: 'pariatur aute reprehenderit',
          stavbaKataster: ['Rača', 'Dúbravka'],
          stavbaSupisneCislo: 6_820_061.931_705_549,
        },
        konanie: {
          konanieTyp: 'Zmena stavby pred dokončením',
          stavbaPisomnosti: [
            'labore in in nostrud id',
            'amet sit',
            'aliquip ullamco id nulla velit',
            'mollit commodo Duis consequat',
            'sint eu labore',
          ],
        },
      },
      formFo: `<?xml version="1.0" encoding="utf-8"?>
      <xsl:stylesheet xml:lang="en" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:z="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1" version="1.0" xmlns:Xsl="http://www.w3.org/1999/XSL/Transform">
      
        <xsl:template match="/z:E-form">
          <xsl:call-template name="base_eform"/>
        </xsl:template>
      
        <!-- this is the template which gets called inside the FO structure -->
        <xsl:template name="body">
          
        <xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'prilohy'"/>
                  <xsl:with-param name="title" select="'Prílohy'"/>
                  <xsl:with-param name="values" select="z:Body/z:Prilohy"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'ziadatel'"/>
                  <xsl:with-param name="title" select="'Žiadateľ'"/>
                  <xsl:with-param name="values" select="z:Body/z:Ziadatel"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'investor'"/>
                  <xsl:with-param name="title" select="'Investor'"/>
                  <xsl:with-param name="values" select="z:Body/z:Investor"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'projektant'"/>
                  <xsl:with-param name="title" select="'Zodpovedný projektant'"/>
                  <xsl:with-param name="values" select="z:Body/z:Projektant"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'stavba'"/>
                  <xsl:with-param name="title" select="'Informácie o stavbe'"/>
                  <xsl:with-param name="values" select="z:Body/z:Stavba"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'konanie'"/>
                  <xsl:with-param name="title" select="'Typ konania na stavebnom úrade'"/>
                  <xsl:with-param name="values" select="z:Body/z:Konanie"/>
                </xsl:call-template></xsl:template>
      
        <!-- XSL cannot dynamically "yield" template, so here is simple mapping for each template based on name -->
        <!-- TODO better way to do this? -->
        <xsl:template name="map">
          <xsl:param name="template"/>
          <xsl:param name="values"/>
      
          <xsl:choose>
            
          <xsl:when test="$template = 'prilohy'">
                  <xsl:call-template name="prilohy">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'ziadatel'">
                  <xsl:call-template name="ziadatel">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'investor'">
                  <xsl:call-template name="investor">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'projektant'">
                  <xsl:call-template name="projektant">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'stavba'">
                  <xsl:call-template name="stavba">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'konanie'">
                  <xsl:call-template name="konanie">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when></xsl:choose>
        </xsl:template>
      
        <!-- ########################## -->
        <!-- ALL templates below, prefixed with "base_", are format-specific and should not be modified. -->
        <!-- ########################## -->
      
        <xsl:template name="base_eform">
          <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
            <fo:layout-master-set>
              <fo:simple-page-master master-name="A4" page-height="842px" page-width="595px" margin-top="10px" margin-bottom="10px" margin-left="10px" margin-right="10px">
                <fo:region-body margin-bottom="20mm"/>
                <fo:region-after region-name="footer" extent="10mm"/>
              </fo:simple-page-master>
              <fo:page-sequence-master master-name="document">
                <fo:repeatable-page-master-alternatives>
                  <fo:conditional-page-master-reference master-reference="A4"/>
                </fo:repeatable-page-master-alternatives>
              </fo:page-sequence-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="document" font-family="Arial">
              <fo:static-content flow-name="footer">
                <fo:block text-align="end"><fo:page-number/></fo:block>
              </fo:static-content>
              <fo:flow flow-name="xsl-region-body">
                <fo:block font-size="20pt" text-align="center">
                  <xsl:value-of select="z:Meta/z:Name"/>
                </fo:block>
                <fo:block color="white">|</fo:block>
                <fo:block/>
      
                <xsl:call-template name="body"/>
      
              </fo:flow>
            </fo:page-sequence>
          </fo:root>
        </xsl:template>
      
        <xsl:template name="base_block_with_title">
          <xsl:param name="template_name"/>
          <xsl:param name="values"/>
          <xsl:param name="title"/>
      
          <xsl:if test="$title">
            <xsl:call-template name="base_title">
              <xsl:with-param name="title" select="$title"/>
            </xsl:call-template>
          </xsl:if>
      
          <xsl:call-template name="base_block">
            <xsl:with-param name="template_name" select="$template_name"/>
            <xsl:with-param name="values" select="$values"/>
          </xsl:call-template>
        </xsl:template>
      
        <xsl:template name="base_block">
          <xsl:param name="template_name"/>
          <xsl:param name="values"/>
      
          <fo:block margin-left="5mm">
            <xsl:call-template name="map">
              <xsl:with-param name="template" select="$template_name"/>
              <xsl:with-param name="values" select="$values"/>
            </xsl:call-template>
          </fo:block>
        </xsl:template>
      
        <xsl:template name="base_format_telefonne_cislo">
          <xsl:param name="node"/>
      
          <xsl:value-of select="concat($node/*[local-name() = 'MedzinarodneVolacieCislo'], ' ')"/>
          <xsl:value-of select="concat($node/*[local-name() = 'Predvolba'], ' ')"/>
          <xsl:value-of select="$node/*[local-name() = 'Cislo']"/>
        </xsl:template>
      
        <xsl:template name="base_boolean">
          <xsl:param name="bool"/>
      
          <xsl:choose>
            <xsl:when test="$bool = 'true'">
              <xsl:text>Áno</xsl:text>
            </xsl:when>
            <xsl:when test="$bool = 'false'">
              <xsl:text>Nie</xsl:text>
            </xsl:when>
          </xsl:choose>
        </xsl:template>
      
        <xsl:template name="base_format_date">
          <xsl:param name="instr"/>
          <!-- YYYY-MM-DD -->
          <xsl:variable name="yyyy">
            <xsl:value-of select="substring($instr,1,4)"/>
          </xsl:variable>
          <xsl:variable name="mm">
            <xsl:value-of select="substring($instr,6,2)"/>
          </xsl:variable>
          <xsl:variable name="dd">
            <xsl:value-of select="substring($instr,9,2)"/>
          </xsl:variable>
      
          <xsl:value-of select="concat($dd,'.',$mm,'.',$yyyy)"/>
        </xsl:template>
      
        <xsl:template name="base_format_datetime">
          <xsl:param name="dateTime"/>
          <xsl:variable name="dateTimeString" select="string($dateTime)"/>
          <xsl:choose>
            <xsl:when test="$dateTimeString!= '' and string-length($dateTimeString)>18 and string(number(substring($dateTimeString, 1, 4))) != 'NaN' ">
              <xsl:value-of select="concat(substring($dateTimeString, 9, 2), '.', substring($dateTimeString, 6, 2), '.', substring($dateTimeString, 1, 4),' ', substring($dateTimeString, 12, 2),':', substring($dateTimeString, 15, 2))"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$dateTimeString"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:template>
      
        <xsl:template name="base_title">
          <xsl:param name="title"/>
      
          <fo:block margin-left="5mm" margin-top="2mm">
            <fo:block padding-left="2mm">
              <xsl:value-of select="$title"/>
            </fo:block>
          </fo:block>
        </xsl:template>
      
        <xsl:template name="base_labeled_field">
          <xsl:param name="text"/>
          <xsl:param name="node"/>
      
          <fo:table space-before="2mm">
            <fo:table-column/>
            <fo:table-column column-width="300px"/>
            <fo:table-body>
              <fo:table-row>
                <fo:table-cell>
                  <fo:block>
                    <xsl:value-of select="$text"/>
                  </fo:block>
                </fo:table-cell>
                <xsl:choose>
                  <xsl:when test="$node">
                    <fo:table-cell border-width="0.6pt" border-style="solid" background-color="white" padding="1pt">
                      <fo:block>
                        <xsl:value-of select="$node"/>
                        <fo:inline color="white">___</fo:inline>
                      </fo:block>
                    </fo:table-cell>
                  </xsl:when>
                  <xsl:otherwise>
                    <fo:table-cell>
                      <fo:block/>
                    </fo:table-cell>
                  </xsl:otherwise>
                </xsl:choose>
              </fo:table-row>
            </fo:table-body>
          </fo:table>
        </xsl:template>
      
        <xsl:template name="base_labeled_textarea">
          <xsl:param name="text"/>
          <xsl:param name="node"/>
      
          <xsl:call-template name="base_labeled_field">
            <xsl:with-param name="text" select="$text"/>
            <xsl:with-param name="node" select="$node"/>
          </xsl:call-template>
        </xsl:template>
      <xsl:template name="prilohy"><xsl:param name="values"/><xsl:for-each select="$values/z:ProjektovaDokumentacia">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Projektová dokumentácia'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each></xsl:template><xsl:template name="ziadatel_mesto_psc"><xsl:param name="values"/><xsl:if test="$values/z:ZiadatelMesto"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Mesto'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelMesto/z:Name"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelPsc"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'PSČ'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelPsc"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="ziadatel"><xsl:param name="values"/><xsl:if test="$values/z:ZiadatelTyp"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Žiadate ako'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelTyp"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelMenoPriezvisko"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Meno a priezvisko'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelMenoPriezvisko"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelObchodneMeno"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Obchodné meno'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelObchodneMeno"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelIco"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'IČO'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelIco"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelAdresaPobytu"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa trvalého pobytu'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelAdresaPobytu"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelMiestoPodnikania"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Miesto podnikania'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelMiestoPodnikania"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelAdresaSidla"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa sídla'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelAdresaSidla"/>
                  </xsl:call-template></xsl:if><xsl:call-template name="ziadatel_mesto_psc">
                    <xsl:with-param name="values" select="$values/*[local-name() = 'ZiadatelMestoPsc']"/>
                  </xsl:call-template><xsl:if test="$values/z:ZiadatelKontaktnaOsoba"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Kontaktná osoba'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelKontaktnaOsoba"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelEmail"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'E-mail'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelEmail"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelTelefon"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Telefónne číslo (v tvare +421...)'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelTelefon"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="investor_mesto_psc"><xsl:param name="values"/><xsl:if test="$values/z:InvestorMesto"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Mesto'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorMesto/z:Name"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorPsc"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'PSČ'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorPsc"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="investor"><xsl:param name="values"/><xsl:if test="$values/z:InvestorZiadatelom"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Je investor rovnaká osoba ako žiadateľ?'"/>
                    <xsl:with-param name="node"><xsl:call-template name="base_boolean"><xsl:with-param name="bool" select="$values/z:InvestorZiadatelom"/></xsl:call-template></xsl:with-param>
                  </xsl:call-template></xsl:if><xsl:for-each select="$values/z:Splnomocnenie">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Splnomocnenie na zastupovanie'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each><xsl:if test="$values/z:InvestorTyp"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Typ investora'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorTyp"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorMenoPriezvisko"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Meno a priezvisko'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorMenoPriezvisko"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorObchodneMeno"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Obchodné meno'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorObchodneMeno"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorIco"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'IČO'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorIco"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorAdresaPobytu"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa trvalého pobytu'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorAdresaPobytu"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorMiestoPodnikania"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Miesto podnikania'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorMiestoPodnikania"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorAdresaSidla"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa sídla'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorAdresaSidla"/>
                  </xsl:call-template></xsl:if><xsl:call-template name="investor_mesto_psc">
                    <xsl:with-param name="values" select="$values/*[local-name() = 'InvestorMestoPsc']"/>
                  </xsl:call-template><xsl:if test="$values/z:InvestorKontaktnaOsoba"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Kontaktná osoba'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorKontaktnaOsoba"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorEmail"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'E-mail'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorEmail"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorTelefon"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Telefónne číslo (v tvare +421...)'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorTelefon"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="projektant"><xsl:param name="values"/><xsl:if test="$values/z:ProjektantMenoPriezvisko"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Meno a priezvisko'"/>
                    <xsl:with-param name="node" select="$values/z:ProjektantMenoPriezvisko"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ProjektantEmail"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'E-mail'"/>
                    <xsl:with-param name="node" select="$values/z:ProjektantEmail"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ProjektantTelefon"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Telefónne číslo (v tvare +421...)'"/>
                    <xsl:with-param name="node" select="$values/z:ProjektantTelefon"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:AutorizacneOsvedcenie"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Číslo autorizačného osvedčenia'"/>
                    <xsl:with-param name="node" select="$values/z:AutorizacneOsvedcenie"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:DatumSpracovania"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Dátum spracovania projektovej dokumentácie'"/>
                    <xsl:with-param name="node"><xsl:call-template name="base_format_date"><xsl:with-param name="instr" select="$values/z:DatumSpracovania"/></xsl:call-template></xsl:with-param>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="stavba"><xsl:param name="values"/><xsl:if test="$values/z:StavbaNazov"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Názov stavby/projektu'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaNazov"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaDruh"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Druh stavby'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaDruh"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaUlica"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Ulica'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaUlica"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaSupisneCislo"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Súpisné číslo'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaSupisneCislo"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaParcela"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Parcelné číslo'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaParcela"/>
                  </xsl:call-template></xsl:if><xsl:for-each select="$values/z:StavbaKataster">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Katastrálne územie'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each></xsl:template><xsl:template name="konanie"><xsl:param name="values"/><xsl:if test="$values/z:KonanieTyp"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Typ konania'"/>
                    <xsl:with-param name="node" select="$values/z:KonanieTyp"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadostOdovodnenie"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Upresnenie konania'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadostOdovodnenie"/>
                  </xsl:call-template></xsl:if><xsl:for-each select="$values/z:StavbaFotodokumentacia">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Fotodokumentácia stavby'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each><xsl:for-each select="$values/z:StavbaPisomnosti">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Relevantné písomnosti súvisiace so stavbou'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each></xsl:template></xsl:stylesheet>`,
      uiSchema: {
        prilohy: {
          'ui:hideError': true,
          projektovaDokumentacia: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              helptext:
                'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
              size: 5,
              accept: '.jpg,.pdf',
              type: 'dragAndDrop',
            },
          },
        },
        ziadatel: {
          'ui:hideError': true,
          ziadatelTyp: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          ziadatelMenoPriezvisko: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelObchodneMeno: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelIco: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          ziadatelAdresaPobytu: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelMiestoPodnikania: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelAdresaSidla: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelKontaktnaOsoba: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelEmail: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelTelefon: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          ziadatelMestoPsc: {
            'ui:order': ['ziadatelMesto', 'ziadatelPsc'],
            'ui:options': {
              objectDisplay: 'columns',
              objectColumnRatio: '3/1',
            },
            ziadatelMesto: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
            ziadatelPsc: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
          },
        },
        investor: {
          'ui:hideError': true,
          investorZiadatelom: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              orientations: 'row',
              variant: 'boxed',
            },
          },
          splnomocnenie: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              helptext: 'nahrajte splnomocnenie od investora',
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
          investorTyp: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          investorMenoPriezvisko: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorObchodneMeno: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorIco: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          investorAdresaPobytu: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorMiestoPodnikania: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorAdresaSidla: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorMestoPsc: {
            'ui:order': ['investorMesto', 'investorPsc'],
            'ui:options': {
              objectDisplay: 'columns',
              objectColumnRatio: '3/1',
            },
            investorMesto: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
            investorPsc: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
          },
          investorKontaktnaOsoba: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorEmail: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorTelefon: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        projektant: {
          'ui:hideError': true,
          projektantMenoPriezvisko: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          projektantEmail: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          projektantTelefon: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          autorizacneOsvedcenie: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              tooltip:
                'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním. ',
            },
          },
          datumSpracovania: {
            'ui:widget': 'DatePicker',
            'ui:label': false,
          },
        },
        stavba: {
          'ui:hideError': true,
          stavbaNazov: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          stavbaDruh: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          stavbaUlica: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          stavbaSupisneCislo: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          stavbaParcela: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          stavbaKataster: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:placeholder': 'Vyberte',
            'ui:options': {
              helptext:
                'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza',
              dropdownDivider: true,
            },
          },
        },
        konanie: {
          'ui:hideError': true,
          konanieTyp: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          ziadostOdovodnenie: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          stavbaFotodokumentacia: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
          stavbaPisomnosti: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              helptext:
                'napr. vydané stavebné povolenie, stanoviská hlavného mesta',
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
        },
      },
      xmlTemplate: `<?xml version="1.0" encoding="utf-8"?>
      <E-form xmlns="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1"
              xsi:schemaLocation="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Meta>
          <ID>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</ID>
          <Name>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</Name>
          <Gestor></Gestor>
          <RecipientId></RecipientId>
          <Version>0.1</Version>
          <ZepRequired>false</ZepRequired>
          <EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid>
          <SenderID>mailto:hruska@example.com</SenderID>
        </Meta>
      </E-form>`,
      jsonSchema: {
        pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
        pospVersion: '0.1',
        title: 'Záväzné stanovisko k investičnej činnosti',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              prilohy: {
                type: 'object',
                title: 'Prílohy',
                hash: 'prilohy',
                properties: {
                  projektovaDokumentacia: {
                    type: 'array',
                    title: 'Projektová dokumentácia',
                    items: {
                      type: 'string',
                      file: true,
                    },
                  },
                },
                required: ['projektovaDokumentacia'],
              },
            },
            required: ['prilohy'],
          },
          {
            type: 'object',
            properties: {
              ziadatel: {
                type: 'object',
                title: 'Žiadateľ',
                hash: 'ziadatel',
                properties: {
                  ziadatelTyp: {
                    title: 'Žiadate ako',
                    type: 'string',
                    default: 'Fyzická osoba',
                    enum: [
                      'Fyzická osoba',
                      'Fyzická osoba - podnikateľ',
                      'Právnicka osoba',
                    ],
                  },
                },
                required: ['ziadatelTyp'],
                allOf: [
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Fyzická osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelMenoPriezvisko: {
                          type: 'string',
                          pattern: '.*[ ].*',
                          title: 'Meno a priezvisko',
                        },
                      },
                      required: ['ziadatelMenoPriezvisko'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          oneOf: [
                            {
                              const: 'Fyzická osoba - podnikateľ',
                            },
                            {
                              const: 'Právnicka osoba',
                            },
                          ],
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelObchodneMeno: {
                          type: 'string',
                          title: 'Obchodné meno',
                        },
                      },
                      required: ['ziadatelObchodneMeno'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelIco: {
                          type: 'number',
                          title: 'IČO',
                        },
                      },
                      required: ['ziadatelIco'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Fyzická osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelAdresaPobytu: {
                          type: 'string',
                          title: 'Adresa trvalého pobytu',
                        },
                      },
                      required: ['ziadatelAdresaPobytu'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Fyzická osoba - podnikateľ',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelMiestoPodnikania: {
                          type: 'string',
                          title: 'Miesto podnikania',
                        },
                      },
                      required: ['ziadatelMiestoPodnikania'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelAdresaSidla: {
                          type: 'string',
                          title: 'Adresa sídla',
                        },
                      },
                      required: ['ziadatelAdresaSidla'],
                    },
                  },
                  {
                    properties: {
                      ziadatelMestoPsc: {
                        type: 'object',
                        properties: {
                          ziadatelMesto: {
                            type: 'string',
                            title: 'Mesto',
                            format: 'ciselnik',
                          },
                          ziadatelPsc: {
                            type: 'string',
                            title: 'PSČ',
                          },
                        },
                        required: ['ziadatelMesto', 'ziadatelPsc'],
                      },
                    },
                    default: {},
                    required: ['ziadatelMestoPsc'],
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelKontaktnaOsoba: {
                          type: 'string',
                          title: 'Kontaktná osoba',
                        },
                      },
                      required: ['ziadatelKontaktnaOsoba'],
                    },
                  },
                  {
                    properties: {
                      ziadatelEmail: {
                        type: 'string',
                        title: 'E-mail',
                        format: 'email',
                      },
                      ziadatelTelefon: {
                        type: 'string',
                        title: 'Telefónne číslo (v tvare +421...)',
                        pattern:
                          '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                      },
                    },
                    required: ['ziadatelEmail', 'ziadatelTelefon'],
                  },
                ],
              },
            },
            required: ['ziadatel'],
          },
          {
            type: 'object',
            properties: {
              investor: {
                type: 'object',
                title: 'Investor',
                hash: 'investor',
                properties: {
                  investorZiadatelom: {
                    title: 'Je investor rovnaká osoba ako žiadateľ?',
                    type: 'boolean',
                    default: true,
                  },
                },
                required: ['investorZiadatelom'],
                allOf: [
                  {
                    if: {
                      properties: {
                        investorZiadatelom: {
                          const: false,
                        },
                      },
                    },
                    then: {
                      properties: {
                        splnomocnenie: {
                          type: 'array',
                          title: 'Splnomocnenie na zastupovanie',
                          items: {
                            type: 'string',
                            file: true,
                          },
                        },
                      },
                      required: ['splnomocnenie'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorZiadatelom: {
                          const: false,
                        },
                      },
                    },
                    then: {
                      allOf: [
                        {
                          properties: {
                            splnomocnenie: {
                              type: 'array',
                              title: 'Splnomocnenie na zastupovanie',
                              items: {
                                type: 'string',
                                file: true,
                              },
                            },
                            investorTyp: {
                              title: 'Typ investora',
                              type: 'string',
                              default: 'Fyzická osoba',
                              enum: [
                                'Fyzická osoba',
                                'Fyzická osoba - podnikateľ',
                                'Právnicka osoba',
                              ],
                            },
                          },
                          required: ['splnomocnenie', 'investorTyp'],
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Fyzická osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorMenoPriezvisko: {
                                type: 'string',
                                pattern: '.*[ ].*',
                                title: 'Meno a priezvisko',
                              },
                            },
                            required: ['investorMenoPriezvisko'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                oneOf: [
                                  {
                                    const: 'Fyzická osoba - podnikateľ',
                                  },
                                  {
                                    const: 'Právnicka osoba',
                                  },
                                ],
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorObchodneMeno: {
                                type: 'string',
                                title: 'Obchodné meno',
                              },
                            },
                            required: ['investorObchodneMeno'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Právnicka osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorIco: {
                                type: 'number',
                                title: 'IČO',
                              },
                            },
                            required: ['investorIco'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Fyzická osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorAdresaPobytu: {
                                type: 'string',
                                title: 'Adresa trvalého pobytu',
                              },
                            },
                            required: ['investorAdresaPobytu'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Fyzická osoba - podnikateľ',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorMiestoPodnikania: {
                                type: 'string',
                                title: 'Miesto podnikania',
                              },
                            },
                            required: ['investorMiestoPodnikania'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Právnicka osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorAdresaSidla: {
                                type: 'string',
                                title: 'Adresa sídla',
                              },
                            },
                            required: ['investorAdresaSidla'],
                          },
                        },
                        {
                          properties: {
                            investorMestoPsc: {
                              type: 'object',
                              properties: {
                                investorMesto: {
                                  type: 'string',
                                  title: 'Mesto',
                                  format: 'ciselnik',
                                },
                                investorPsc: {
                                  type: 'string',
                                  title: 'PSČ',
                                },
                              },
                              required: ['investorMesto', 'investorPsc'],
                            },
                          },
                          required: ['investorMestoPsc'],
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Právnicka osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorKontaktnaOsoba: {
                                type: 'string',
                                title: 'Kontaktná osoba',
                              },
                            },
                            required: ['investorKontaktnaOsoba'],
                          },
                        },
                        {
                          properties: {
                            investorEmail: {
                              type: 'string',
                              title: 'E-mail',
                              format: 'email',
                            },
                            investorTelefon: {
                              type: 'string',
                              title: 'Telefónne číslo (v tvare +421...)',
                              pattern:
                                '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                            },
                          },
                          required: ['investorEmail', 'investorTelefon'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            required: ['investor'],
          },
          {
            type: 'object',
            properties: {
              projektant: {
                type: 'object',
                title: 'Zodpovedný projektant',
                hash: 'zodpovedny-projektant',
                properties: {
                  projektantMenoPriezvisko: {
                    type: 'string',
                    pattern: '.*[ ].*',
                    title: 'Meno a priezvisko',
                  },
                  projektantEmail: {
                    type: 'string',
                    title: 'E-mail',
                    format: 'email',
                  },
                  projektantTelefon: {
                    type: 'string',
                    title: 'Telefónne číslo (v tvare +421...)',
                    pattern:
                      '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                  },
                  autorizacneOsvedcenie: {
                    type: 'string',
                    title: 'Číslo autorizačného osvedčenia',
                    description:
                      'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním. ',
                  },
                  datumSpracovania: {
                    type: 'string',
                    title: 'Dátum spracovania projektovej dokumentácie',
                    format: 'date',
                  },
                },
                required: [
                  'projektantMenoPriezvisko',
                  'projektantEmail',
                  'projektantTelefon',
                  'autorizacneOsvedcenie',
                  'datumSpracovania',
                ],
              },
            },
            required: ['projektant'],
          },
          {
            type: 'object',
            properties: {
              stavba: {
                type: 'object',
                title: 'Informácie o stavbe',
                hash: 'informacie-o-stavbe',
                properties: {
                  stavbaNazov: {
                    type: 'string',
                    title: 'Názov stavby/projektu',
                  },
                  stavbaDruh: {
                    type: 'string',
                    title: 'Druh stavby',
                    default: 'Bytový dom',
                    enum: [
                      'Bytový dom',
                      'Rodinný dom',
                      'Iná budova na bývanie',
                      'Nebytová budova',
                      'Inžinierska stavba',
                      'Iné',
                    ],
                  },
                  stavbaUlica: {
                    type: 'string',
                    title: 'Ulica',
                  },
                  stavbaSupisneCislo: {
                    type: 'number',
                    title: 'Súpisné číslo',
                  },
                  stavbaParcela: {
                    title: 'Parcelné číslo',
                    description:
                      'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na katastrálnej mape ZBGIS.',
                    type: 'string',
                  },
                  stavbaKataster: {
                    title: 'Katastrálne územie',
                    type: 'array',
                    uniqueItems: true,
                    minItems: 1,
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'Čuňovo',
                          title: 'Čuňovo',
                        },
                        {
                          const: 'Devín',
                          title: 'Devín',
                        },
                        {
                          const: 'Devínska Nová Ves',
                          title: 'Devínska Nová Ves',
                        },
                        {
                          const: 'Dúbravka',
                          title: 'Dúbravka',
                        },
                        {
                          const: 'Jarovce',
                          title: 'Jarovce',
                        },
                        {
                          const: 'Karlova Ves',
                          title: 'Karlova Ves',
                        },
                        {
                          const: 'Lamač',
                          title: 'Lamač',
                        },
                        {
                          const: 'Nivy',
                          title: 'Nivy',
                        },
                        {
                          const: 'Nové Mesto',
                          title: 'Nové Mesto',
                        },
                        {
                          const: 'Petržalka',
                          title: 'Petržalka',
                        },
                        {
                          const: 'Podunajské Biskupice',
                          title: 'Podunajské Biskupice',
                        },
                        {
                          const: 'Rača',
                          title: 'Rača',
                        },
                        {
                          const: 'Rusovce',
                          title: 'Rusovce',
                        },
                        {
                          const: 'Ružinov',
                          title: 'Ružinov',
                        },
                        {
                          const: 'Staré mesto',
                          title: 'Staré mesto',
                        },
                        {
                          const: 'Trnávka',
                          title: 'Trnávka',
                        },
                        {
                          const: 'Vajnory',
                          title: 'Vajnory',
                        },
                        {
                          const: 'Vinohrady',
                          title: 'Vinohrady',
                        },
                        {
                          const: 'Vrakuňa',
                          title: 'Vrakuňa',
                        },
                        {
                          const: 'Záhorská Bystrica',
                          title: 'Záhorská Bystrica',
                        },
                      ],
                    },
                  },
                },
                required: [
                  'stavbaNazov',
                  'stavbaDruh',
                  'stavbaUlica',
                  'stavbaParcela',
                  'stavbaKataster',
                ],
              },
            },
            required: ['stavba'],
          },
          {
            type: 'object',
            properties: {
              konanie: {
                type: 'object',
                title: 'Typ konania na stavebnom úrade',
                hash: 'typ-konania-na-stavebnom-urade',
                properties: {
                  konanieTyp: {
                    title: 'Typ konania',
                    type: 'string',
                    default: 'Územné konanie',
                    enum: [
                      'Územné konanie',
                      'Územné konanie spojené so stavebným konaním',
                      'Zmena stavby pred dokončením',
                      'Zmena v užívaní stavby',
                      'Konanie o dodatočnom povolení stavby',
                    ],
                  },
                },
                required: ['konanieTyp'],
                allOf: [
                  {
                    if: {
                      properties: {
                        konanieTyp: {
                          const: 'Konanie o dodatočnom povolení stavby',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadostOdovodnenie: {
                          type: 'string',
                          title: 'Upresnenie konania',
                          default:
                            'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                          enum: [
                            'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                            'Dodatočné povolenie zmeny stavby pred dokončením',
                          ],
                        },
                      },
                      allOf: [
                        {
                          if: {
                            properties: {
                              ziadostOdovodnenie: {
                                const:
                                  'Dodatočné povolenie zmeny stavby pred dokončením',
                              },
                            },
                          },
                          then: {
                            properties: {
                              stavbaFotodokumentacia: {
                                type: 'array',
                                title: 'Fotodokumentácia stavby',
                                items: {
                                  type: 'string',
                                  file: true,
                                },
                              },
                              stavbaPisomnosti: {
                                type: 'array',
                                title:
                                  'Relevantné písomnosti súvisiace so stavbou',
                                items: {
                                  type: 'string',
                                  file: true,
                                },
                              },
                            },
                            required: [
                              'stavbaFotodokumentacia',
                              'stavbaPisomnosti',
                            ],
                          },
                        },
                      ],
                      required: ['ziadostOdovodnenie'],
                    },
                  },
                ],
              },
            },
            required: ['konanie'],
          },
        ],
      },
    },
  })

  await prisma.schema.update({
    where: {
      id: schema.id,
    },
    data: {
      latestVersionId: schemaVersionv3.id,
    },
  })

  await prisma.schema.update({
    where: {
      id: zavazneStanoviskoSchema.id,
    },
    data: {
      latestVersionId: zavazneStanoviskoSchemaVersionNew.id,
    },
  })

  const stanoviskoSchema = await prisma.schema.create({
    data: {
      formName: 'Stanovisko k investičnému zámeru',
      slug: 'stanovisko-k-investicnemu-zameru',
      category: null,
      messageSubject: 'Podanie',
    },
  })

  const stanoviskoSchemaVersion = await prisma.schemaVersion.create({
    data: {
      version: 'v0.0.1',
      pospID: 'stanoviskoKInvesticnemuZameru',
      pospVersion: '0.1',
      schemaId: stanoviskoSchema.id,
      data: {
        prilohy: {
          architektonickaStudia: [
            'laboris nisi ad cupidatat tempor',
            'consequat Ut Lorem ut laborum',
            'dolor cupidatat',
            'Lorem ut consectetur tempor',
            'ut exercitation occaecat',
          ],
        },
        ziadatel: {
          ziadatelTyp: 'Fyzická osoba',
          ziadatelMestoPsc: {
            ziadatelMesto: 'dyjICccg',
            ziadatelPsc: 'laborum ex',
          },
          ziadatelEmail: 'MQCm@iMACoLfJzMUVUUuBaAFkcJSrWIlIQufXT.ax',
          ziadatelTelefon: '008',
          ziadatelAdresaSidla: 'adipisicing ex magna',
          ziadatelMiestoPodnikania: 'laborum incididunt',
          ziadatelMenoPriezvisko: '~Keb(Vj oN ITn>r.',
          ziadatelIco: -85_003_425.710_544_14,
          ziadatelKontaktnaOsoba: 'laboris',
          ziadatelObchodneMeno: 'Excepteur',
          ziadatelAdresaPobytu: 'dolor',
        },
        investor: {
          investorZiadatelom: true,
          investorIco: -73_445_810.065_955_58,
          investorAdresaSidla: 'do consectetur dolore officia labore',
          investorMiestoPodnikania: 'elit in dolore esse fugiat',
          investorMenoPriezvisko: 'S_ iwO',
          investorMestoPsc: {
            investorMesto: 'kIwYeeLcw',
            investorPsc: 'anim ut ex sed sint',
          },
        },
        projektant: {
          projektantMenoPriezvisko: 'q4:*{B p({9',
          projektantEmail: 'gTrSrY@qV.drf',
          projektantTelefon: '00246337650218',
          autorizacneOsvedcenie: 'ex anim nisi',
          datumSpracovania: '2013-01-08',
        },
        stavba: {
          stavbaNazov: 'minim in proident enim',
          stavbaDruh: 'Inžinierska stavba',
          stavbaUlica: 'in elit nisi et',
          stavbaParcela: 'deserunt',
          stavbaKataster: ['Rusovce', 'Rača', 'Ružinov'],
          stavbaSupisneCislo: 91_385_932.835_448_68,
        },
      },
      formFo: `<?xml version="1.0" encoding="utf-8"?>
      <xsl:stylesheet xml:lang="en" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:z="http://schemas.gov.sk/doc/eform/stanoviskoKInvesticnemuZameru/0.1" version="1.0" xmlns:Xsl="http://www.w3.org/1999/XSL/Transform">
      
        <xsl:template match="/z:E-form">
          <xsl:call-template name="base_eform"/>
        </xsl:template>
      
        <!-- this is the template which gets called inside the FO structure -->
        <xsl:template name="body">
          
        <xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'prilohy'"/>
                  <xsl:with-param name="title" select="'Prílohy'"/>
                  <xsl:with-param name="values" select="z:Body/z:Prilohy"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'ziadatel'"/>
                  <xsl:with-param name="title" select="'Žiadateľ'"/>
                  <xsl:with-param name="values" select="z:Body/z:Ziadatel"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'investor'"/>
                  <xsl:with-param name="title" select="'Investor'"/>
                  <xsl:with-param name="values" select="z:Body/z:Investor"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'projektant'"/>
                  <xsl:with-param name="title" select="'Zodpovedný projektant'"/>
                  <xsl:with-param name="values" select="z:Body/z:Projektant"/>
                </xsl:call-template><xsl:call-template name="base_block_with_title">
                  <xsl:with-param name="template_name" select="'stavba'"/>
                  <xsl:with-param name="title" select="'Informácie o stavbe'"/>
                  <xsl:with-param name="values" select="z:Body/z:Stavba"/>
                </xsl:call-template></xsl:template>
      
        <!-- XSL cannot dynamically "yield" template, so here is simple mapping for each template based on name -->
        <!-- TODO better way to do this? -->
        <xsl:template name="map">
          <xsl:param name="template"/>
          <xsl:param name="values"/>
      
          <xsl:choose>
            
          <xsl:when test="$template = 'prilohy'">
                  <xsl:call-template name="prilohy">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'ziadatel'">
                  <xsl:call-template name="ziadatel">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'investor'">
                  <xsl:call-template name="investor">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'projektant'">
                  <xsl:call-template name="projektant">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when><xsl:when test="$template = 'stavba'">
                  <xsl:call-template name="stavba">
                    <xsl:with-param name="values" select="$values"/>
                  </xsl:call-template>
                </xsl:when></xsl:choose>
        </xsl:template>
      
        <!-- ########################## -->
        <!-- ALL templates below, prefixed with "base_", are format-specific and should not be modified. -->
        <!-- ########################## -->
      
        <xsl:template name="base_eform">
          <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
            <fo:layout-master-set>
              <fo:simple-page-master master-name="A4" page-height="842px" page-width="595px" margin-top="10px" margin-bottom="10px" margin-left="10px" margin-right="10px">
                <fo:region-body margin-bottom="20mm"/>
                <fo:region-after region-name="footer" extent="10mm"/>
              </fo:simple-page-master>
              <fo:page-sequence-master master-name="document">
                <fo:repeatable-page-master-alternatives>
                  <fo:conditional-page-master-reference master-reference="A4"/>
                </fo:repeatable-page-master-alternatives>
              </fo:page-sequence-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="document" font-family="Arial">
              <fo:static-content flow-name="footer">
                <fo:block text-align="end"><fo:page-number/></fo:block>
              </fo:static-content>
              <fo:flow flow-name="xsl-region-body">
                <fo:block font-size="20pt" text-align="center">
                  <xsl:value-of select="z:Meta/z:Name"/>
                </fo:block>
                <fo:block color="white">|</fo:block>
                <fo:block/>
      
                <xsl:call-template name="body"/>
      
              </fo:flow>
            </fo:page-sequence>
          </fo:root>
        </xsl:template>
      
        <xsl:template name="base_block_with_title">
          <xsl:param name="template_name"/>
          <xsl:param name="values"/>
          <xsl:param name="title"/>
      
          <xsl:if test="$title">
            <xsl:call-template name="base_title">
              <xsl:with-param name="title" select="$title"/>
            </xsl:call-template>
          </xsl:if>
      
          <xsl:call-template name="base_block">
            <xsl:with-param name="template_name" select="$template_name"/>
            <xsl:with-param name="values" select="$values"/>
          </xsl:call-template>
        </xsl:template>
      
        <xsl:template name="base_block">
          <xsl:param name="template_name"/>
          <xsl:param name="values"/>
      
          <fo:block margin-left="5mm">
            <xsl:call-template name="map">
              <xsl:with-param name="template" select="$template_name"/>
              <xsl:with-param name="values" select="$values"/>
            </xsl:call-template>
          </fo:block>
        </xsl:template>
      
        <xsl:template name="base_format_telefonne_cislo">
          <xsl:param name="node"/>
      
          <xsl:value-of select="concat($node/*[local-name() = 'MedzinarodneVolacieCislo'], ' ')"/>
          <xsl:value-of select="concat($node/*[local-name() = 'Predvolba'], ' ')"/>
          <xsl:value-of select="$node/*[local-name() = 'Cislo']"/>
        </xsl:template>
      
        <xsl:template name="base_boolean">
          <xsl:param name="bool"/>
      
          <xsl:choose>
            <xsl:when test="$bool = 'true'">
              <xsl:text>Áno</xsl:text>
            </xsl:when>
            <xsl:when test="$bool = 'false'">
              <xsl:text>Nie</xsl:text>
            </xsl:when>
          </xsl:choose>
        </xsl:template>
      
        <xsl:template name="base_format_date">
          <xsl:param name="instr"/>
          <!-- YYYY-MM-DD -->
          <xsl:variable name="yyyy">
            <xsl:value-of select="substring($instr,1,4)"/>
          </xsl:variable>
          <xsl:variable name="mm">
            <xsl:value-of select="substring($instr,6,2)"/>
          </xsl:variable>
          <xsl:variable name="dd">
            <xsl:value-of select="substring($instr,9,2)"/>
          </xsl:variable>
      
          <xsl:value-of select="concat($dd,'.',$mm,'.',$yyyy)"/>
        </xsl:template>
      
        <xsl:template name="base_format_datetime">
          <xsl:param name="dateTime"/>
          <xsl:variable name="dateTimeString" select="string($dateTime)"/>
          <xsl:choose>
            <xsl:when test="$dateTimeString!= '' and string-length($dateTimeString)>18 and string(number(substring($dateTimeString, 1, 4))) != 'NaN' ">
              <xsl:value-of select="concat(substring($dateTimeString, 9, 2), '.', substring($dateTimeString, 6, 2), '.', substring($dateTimeString, 1, 4),' ', substring($dateTimeString, 12, 2),':', substring($dateTimeString, 15, 2))"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$dateTimeString"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:template>
      
        <xsl:template name="base_title">
          <xsl:param name="title"/>
      
          <fo:block margin-left="5mm" margin-top="2mm">
            <fo:block padding-left="2mm">
              <xsl:value-of select="$title"/>
            </fo:block>
          </fo:block>
        </xsl:template>
      
        <xsl:template name="base_labeled_field">
          <xsl:param name="text"/>
          <xsl:param name="node"/>
      
          <fo:table space-before="2mm">
            <fo:table-column/>
            <fo:table-column column-width="300px"/>
            <fo:table-body>
              <fo:table-row>
                <fo:table-cell>
                  <fo:block>
                    <xsl:value-of select="$text"/>
                  </fo:block>
                </fo:table-cell>
                <xsl:choose>
                  <xsl:when test="$node">
                    <fo:table-cell border-width="0.6pt" border-style="solid" background-color="white" padding="1pt">
                      <fo:block>
                        <xsl:value-of select="$node"/>
                        <fo:inline color="white">___</fo:inline>
                      </fo:block>
                    </fo:table-cell>
                  </xsl:when>
                  <xsl:otherwise>
                    <fo:table-cell>
                      <fo:block/>
                    </fo:table-cell>
                  </xsl:otherwise>
                </xsl:choose>
              </fo:table-row>
            </fo:table-body>
          </fo:table>
        </xsl:template>
      
        <xsl:template name="base_labeled_textarea">
          <xsl:param name="text"/>
          <xsl:param name="node"/>
      
          <xsl:call-template name="base_labeled_field">
            <xsl:with-param name="text" select="$text"/>
            <xsl:with-param name="node" select="$node"/>
          </xsl:call-template>
        </xsl:template>
      <xsl:template name="prilohy"><xsl:param name="values"/><xsl:for-each select="$values/z:ArchitektonickaStudia">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Architektonická štúdia'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each></xsl:template><xsl:template name="ziadatel_mesto_psc"><xsl:param name="values"/><xsl:if test="$values/z:ZiadatelMesto"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Mesto'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelMesto/z:Name"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelPsc"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'PSČ'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelPsc"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="ziadatel"><xsl:param name="values"/><xsl:if test="$values/z:ZiadatelTyp"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Žiadate ako'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelTyp"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelMenoPriezvisko"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Meno a priezvisko'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelMenoPriezvisko"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelObchodneMeno"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Obchodné meno'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelObchodneMeno"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelIco"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'IČO'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelIco"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelAdresaPobytu"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa trvalého pobytu'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelAdresaPobytu"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelMiestoPodnikania"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Miesto podnikania'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelMiestoPodnikania"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelAdresaSidla"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa sídla'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelAdresaSidla"/>
                  </xsl:call-template></xsl:if><xsl:call-template name="ziadatel_mesto_psc">
                    <xsl:with-param name="values" select="$values/*[local-name() = 'ZiadatelMestoPsc']"/>
                  </xsl:call-template><xsl:if test="$values/z:ZiadatelKontaktnaOsoba"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Kontaktná osoba'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelKontaktnaOsoba"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelEmail"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'E-mail'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelEmail"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ZiadatelTelefon"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Telefónne číslo (v tvare +421...)'"/>
                    <xsl:with-param name="node" select="$values/z:ZiadatelTelefon"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="investor_mesto_psc"><xsl:param name="values"/><xsl:if test="$values/z:InvestorMesto"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Mesto'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorMesto/z:Name"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorPsc"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'PSČ'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorPsc"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="investor"><xsl:param name="values"/><xsl:if test="$values/z:InvestorZiadatelom"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Je investor rovnaká osoba ako žiadateľ?'"/>
                    <xsl:with-param name="node"><xsl:call-template name="base_boolean"><xsl:with-param name="bool" select="$values/z:InvestorZiadatelom"/></xsl:call-template></xsl:with-param>
                  </xsl:call-template></xsl:if><xsl:for-each select="$values/z:Splnomocnenie">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Splnomocnenie na zastupovanie'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each><xsl:if test="$values/z:InvestorTyp"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Typ investora'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorTyp"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorMenoPriezvisko"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Meno a priezvisko'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorMenoPriezvisko"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorObchodneMeno"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Obchodné meno'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorObchodneMeno"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorIco"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'IČO'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorIco"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorAdresaPobytu"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa trvalého pobytu'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorAdresaPobytu"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorMiestoPodnikania"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Miesto podnikania'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorMiestoPodnikania"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorAdresaSidla"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Adresa sídla'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorAdresaSidla"/>
                  </xsl:call-template></xsl:if><xsl:call-template name="investor_mesto_psc">
                    <xsl:with-param name="values" select="$values/*[local-name() = 'InvestorMestoPsc']"/>
                  </xsl:call-template><xsl:if test="$values/z:InvestorKontaktnaOsoba"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Kontaktná osoba'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorKontaktnaOsoba"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorEmail"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'E-mail'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorEmail"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:InvestorTelefon"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Telefónne číslo (v tvare +421...)'"/>
                    <xsl:with-param name="node" select="$values/z:InvestorTelefon"/>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="projektant"><xsl:param name="values"/><xsl:if test="$values/z:ProjektantMenoPriezvisko"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Meno a priezvisko'"/>
                    <xsl:with-param name="node" select="$values/z:ProjektantMenoPriezvisko"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ProjektantEmail"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'E-mail'"/>
                    <xsl:with-param name="node" select="$values/z:ProjektantEmail"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:ProjektantTelefon"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Telefónne číslo (v tvare +421...)'"/>
                    <xsl:with-param name="node" select="$values/z:ProjektantTelefon"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:AutorizacneOsvedcenie"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Číslo autorizačného osvedčenia'"/>
                    <xsl:with-param name="node" select="$values/z:AutorizacneOsvedcenie"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:DatumSpracovania"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Dátum spracovania projektovej dokumentácie'"/>
                    <xsl:with-param name="node"><xsl:call-template name="base_format_date"><xsl:with-param name="instr" select="$values/z:DatumSpracovania"/></xsl:call-template></xsl:with-param>
                  </xsl:call-template></xsl:if></xsl:template><xsl:template name="stavba"><xsl:param name="values"/><xsl:if test="$values/z:StavbaNazov"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Názov stavby/projektu'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaNazov"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaDruh"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Druh stavby'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaDruh"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaUlica"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Ulica'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaUlica"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaSupisneCislo"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Súpisné číslo'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaSupisneCislo"/>
                  </xsl:call-template></xsl:if><xsl:if test="$values/z:StavbaParcela"><xsl:call-template name="base_labeled_field">
                    <xsl:with-param name="text" select="'Parcelné číslo'"/>
                    <xsl:with-param name="node" select="$values/z:StavbaParcela"/>
                  </xsl:call-template></xsl:if><xsl:for-each select="$values/z:StavbaKataster">
                    <xsl:call-template name="base_labeled_field">
                      <xsl:with-param name="text" select="'Katastrálne územie'"/>
                      <xsl:with-param name="node" select="."/>
                    </xsl:call-template>
                  </xsl:for-each></xsl:template></xsl:stylesheet>`,
      uiSchema: {
        prilohy: {
          'ui:hideError': true,
          architektonickaStudia: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              helptext:
                'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
              size: 5,
              accept: '.jpg,.pdf',
              type: 'dragAndDrop',
            },
          },
        },
        ziadatel: {
          'ui:hideError': true,
          ziadatelTyp: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          ziadatelMenoPriezvisko: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelObchodneMeno: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelIco: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          ziadatelAdresaPobytu: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelMiestoPodnikania: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelAdresaSidla: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelKontaktnaOsoba: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelEmail: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          ziadatelTelefon: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          ziadatelMestoPsc: {
            'ui:order': ['ziadatelMesto', 'ziadatelPsc'],
            'ui:options': {
              objectDisplay: 'columns',
              objectColumnRatio: '3/1',
            },
            ziadatelMesto: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
            ziadatelPsc: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
          },
        },
        investor: {
          'ui:hideError': true,
          investorZiadatelom: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              orientations: 'row',
              variant: 'boxed',
            },
          },
          splnomocnenie: {
            'ui:widget': 'Upload',
            'ui:label': false,
            'ui:options': {
              helptext: 'nahrajte splnomocnenie od investora',
              size: 5,
              accept: '.jpg,.pdf',
              type: 'button',
            },
          },
          investorTyp: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          investorMenoPriezvisko: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorObchodneMeno: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorIco: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          investorAdresaPobytu: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorMiestoPodnikania: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorAdresaSidla: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorMestoPsc: {
            'ui:order': ['investorMesto', 'investorPsc'],
            'ui:options': {
              objectDisplay: 'columns',
              objectColumnRatio: '3/1',
            },
            investorMesto: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
            investorPsc: {
              'ui:widget': 'InputField',
              'ui:label': false,
              'ui:options': {
                size: 'large',
              },
            },
          },
          investorKontaktnaOsoba: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorEmail: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          investorTelefon: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
        },
        projektant: {
          'ui:hideError': true,
          projektantMenoPriezvisko: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          projektantEmail: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          projektantTelefon: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          autorizacneOsvedcenie: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              tooltip:
                'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním. ',
            },
          },
          datumSpracovania: {
            'ui:widget': 'DatePicker',
            'ui:label': false,
          },
        },
        stavba: {
          'ui:hideError': true,
          stavbaNazov: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          stavbaDruh: {
            'ui:widget': 'RadioButton',
            'ui:label': false,
            'ui:options': {
              variant: 'boxed',
            },
          },
          stavbaUlica: {
            'ui:widget': 'InputField',
            'ui:label': false,
            'ui:options': {
              size: 'large',
            },
          },
          stavbaSupisneCislo: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          stavbaParcela: {
            'ui:widget': 'InputField',
            'ui:label': false,
          },
          stavbaKataster: {
            'ui:widget': 'SelectField',
            'ui:label': false,
            'ui:placeholder': 'Vyberte',
            'ui:options': {
              helptext:
                'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza',
              dropdownDivider: true,
            },
          },
        },
      },
      xmlTemplate: `<?xml version="1.0" encoding="utf-8"?>
      <E-form xmlns="http://schemas.gov.sk/doc/eform/stanoviskoKInvesticnemuZameru/0.1"
              xsi:schemaLocation="http://schemas.gov.sk/doc/eform/stanoviskoKInvesticnemuZameru/0.1"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Meta>
          <ID>stanoviskoKInvesticnemuZameru</ID>
          <Name>stanoviskoKInvesticnemuZameru</Name>
          <Gestor></Gestor>
          <RecipientId></RecipientId>
          <Version>0.1</Version>
          <ZepRequired>false</ZepRequired>
          <EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid>
          <SenderID>mailto:hruska@example.com</SenderID>
        </Meta>
      </E-form>`,
      jsonSchema: {
        pospID: 'stanoviskoKInvesticnemuZameru',
        pospVersion: '0.1',
        title: 'Stanovisko k investičnému zámeru',
        type: 'object',
        allOf: [
          {
            properties: {
              prilohy: {
                type: 'object',
                title: 'Prílohy',
                hash: 'prilohy',
                properties: {
                  architektonickaStudia: {
                    type: 'array',
                    title: 'Architektonická štúdia',
                    items: {
                      type: 'string',
                      file: true,
                    },
                  },
                },
                required: ['architektonickaStudia'],
              },
            },
            required: ['prilohy'],
          },
          {
            properties: {
              ziadatel: {
                type: 'object',
                title: 'Žiadateľ',
                hash: 'ziadatel',
                properties: {
                  ziadatelTyp: {
                    title: 'Žiadate ako',
                    type: 'string',
                    default: 'Fyzická osoba',
                    enum: [
                      'Fyzická osoba',
                      'Fyzická osoba - podnikateľ',
                      'Právnicka osoba',
                    ],
                  },
                },
                required: ['ziadatelTyp'],
                allOf: [
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Fyzická osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelMenoPriezvisko: {
                          type: 'string',
                          pattern: '.*[ ].*',
                          title: 'Meno a priezvisko',
                        },
                      },
                      required: ['ziadatelMenoPriezvisko'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          oneOf: [
                            {
                              const: 'Fyzická osoba - podnikateľ',
                            },
                            {
                              const: 'Právnicka osoba',
                            },
                          ],
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelObchodneMeno: {
                          type: 'string',
                          title: 'Obchodné meno',
                        },
                      },
                      required: ['ziadatelObchodneMeno'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelIco: {
                          type: 'number',
                          title: 'IČO',
                        },
                      },
                      required: ['ziadatelIco'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Fyzická osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelAdresaPobytu: {
                          type: 'string',
                          title: 'Adresa trvalého pobytu',
                        },
                      },
                      required: ['ziadatelAdresaPobytu'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Fyzická osoba - podnikateľ',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelMiestoPodnikania: {
                          type: 'string',
                          title: 'Miesto podnikania',
                        },
                      },
                      required: ['ziadatelMiestoPodnikania'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelAdresaSidla: {
                          type: 'string',
                          title: 'Adresa sídla',
                        },
                      },
                      required: ['ziadatelAdresaSidla'],
                    },
                  },
                  {
                    properties: {
                      ziadatelMestoPsc: {
                        type: 'object',
                        properties: {
                          ziadatelMesto: {
                            type: 'string',
                            title: 'Mesto',
                            format: 'ciselnik',
                          },
                          ziadatelPsc: {
                            type: 'string',
                            title: 'PSČ',
                          },
                        },
                        required: ['ziadatelMesto', 'ziadatelPsc'],
                      },
                    },
                    required: ['ziadatelMestoPsc'],
                  },
                  {
                    if: {
                      properties: {
                        ziadatelTyp: {
                          const: 'Právnicka osoba',
                        },
                      },
                    },
                    then: {
                      properties: {
                        ziadatelKontaktnaOsoba: {
                          type: 'string',
                          title: 'Kontaktná osoba',
                        },
                      },
                      required: ['ziadatelKontaktnaOsoba'],
                    },
                  },
                  {
                    properties: {
                      ziadatelEmail: {
                        type: 'string',
                        title: 'E-mail',
                        format: 'email',
                      },
                      ziadatelTelefon: {
                        type: 'string',
                        title: 'Telefónne číslo (v tvare +421...)',
                        pattern:
                          '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                      },
                    },
                    required: ['ziadatelEmail', 'ziadatelTelefon'],
                  },
                ],
              },
            },
            required: ['ziadatel'],
          },
          {
            properties: {
              investor: {
                type: 'object',
                title: 'Investor',
                hash: 'investor',
                properties: {
                  investorZiadatelom: {
                    title: 'Je investor rovnaká osoba ako žiadateľ?',
                    type: 'boolean',
                    default: true,
                  },
                },
                required: ['investorZiadatelom'],
                allOf: [
                  {
                    if: {
                      properties: {
                        investorZiadatelom: {
                          const: false,
                        },
                      },
                    },
                    then: {
                      properties: {
                        splnomocnenie: {
                          type: 'array',
                          title: 'Splnomocnenie na zastupovanie',
                          items: {
                            type: 'string',
                            file: true,
                          },
                        },
                      },
                      required: ['splnomocnenie'],
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorZiadatelom: {
                          const: false,
                        },
                      },
                    },
                    then: {
                      allOf: [
                        {
                          properties: {
                            splnomocnenie: {
                              type: 'array',
                              title: 'Splnomocnenie na zastupovanie',
                              items: {
                                type: 'string',
                                file: true,
                              },
                            },
                            investorTyp: {
                              title: 'Typ investora',
                              type: 'string',
                              default: 'Fyzická osoba',
                              enum: [
                                'Fyzická osoba',
                                'Fyzická osoba - podnikateľ',
                                'Právnicka osoba',
                              ],
                            },
                          },
                          required: ['splnomocnenie', 'investorTyp'],
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Fyzická osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorMenoPriezvisko: {
                                type: 'string',
                                pattern: '.*[ ].*',
                                title: 'Meno a priezvisko',
                              },
                            },
                            required: ['investorMenoPriezvisko'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                oneOf: [
                                  {
                                    const: 'Fyzická osoba - podnikateľ',
                                  },
                                  {
                                    const: 'Právnicka osoba',
                                  },
                                ],
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorObchodneMeno: {
                                type: 'string',
                                title: 'Obchodné meno',
                              },
                            },
                            required: ['investorObchodneMeno'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Právnicka osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorIco: {
                                type: 'number',
                                title: 'IČO',
                              },
                            },
                            required: ['investorIco'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Fyzická osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorAdresaPobytu: {
                                type: 'string',
                                title: 'Adresa trvalého pobytu',
                              },
                            },
                            required: ['investorAdresaPobytu'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Fyzická osoba - podnikateľ',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorMiestoPodnikania: {
                                type: 'string',
                                title: 'Miesto podnikania',
                              },
                            },
                            required: ['investorMiestoPodnikania'],
                          },
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Právnicka osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorAdresaSidla: {
                                type: 'string',
                                title: 'Adresa sídla',
                              },
                            },
                            required: ['investorAdresaSidla'],
                          },
                        },
                        {
                          properties: {
                            investorMestoPsc: {
                              type: 'object',
                              properties: {
                                investorMesto: {
                                  type: 'string',
                                  title: 'Mesto',
                                  format: 'ciselnik',
                                },
                                investorPsc: {
                                  type: 'string',
                                  title: 'PSČ',
                                },
                              },
                              required: ['investorMesto', 'investorPsc'],
                            },
                          },
                          required: ['investorMestoPsc'],
                        },
                        {
                          if: {
                            properties: {
                              investorTyp: {
                                const: 'Právnicka osoba',
                              },
                            },
                          },
                          then: {
                            properties: {
                              investorKontaktnaOsoba: {
                                type: 'string',
                                title: 'Kontaktná osoba',
                              },
                            },
                            required: ['investorKontaktnaOsoba'],
                          },
                        },
                        {
                          properties: {
                            investorEmail: {
                              type: 'string',
                              title: 'E-mail',
                              format: 'email',
                            },
                            investorTelefon: {
                              type: 'string',
                              title: 'Telefónne číslo (v tvare +421...)',
                              pattern:
                                '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                            },
                          },
                          required: ['investorEmail', 'investorTelefon'],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            required: ['investor'],
          },
          {
            properties: {
              projektant: {
                type: 'object',
                title: 'Zodpovedný projektant',
                hash: 'zodpovedny-projektant',
                properties: {
                  projektantMenoPriezvisko: {
                    type: 'string',
                    pattern: '.*[ ].*',
                    title: 'Meno a priezvisko',
                  },
                  projektantEmail: {
                    type: 'string',
                    title: 'E-mail',
                    format: 'email',
                  },
                  projektantTelefon: {
                    type: 'string',
                    title: 'Telefónne číslo (v tvare +421...)',
                    pattern:
                      '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                  },
                  autorizacneOsvedcenie: {
                    type: 'string',
                    title: 'Číslo autorizačného osvedčenia',
                    description:
                      'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním. ',
                  },
                  datumSpracovania: {
                    type: 'string',
                    title: 'Dátum spracovania projektovej dokumentácie',
                    format: 'date',
                  },
                },
                required: [
                  'projektantMenoPriezvisko',
                  'projektantEmail',
                  'projektantTelefon',
                  'autorizacneOsvedcenie',
                  'datumSpracovania',
                ],
              },
            },
            required: ['projektant'],
          },
          {
            properties: {
              stavba: {
                type: 'object',
                title: 'Informácie o stavbe',
                hash: 'informacie-o-stavbe',
                properties: {
                  stavbaNazov: {
                    type: 'string',
                    title: 'Názov stavby/projektu',
                  },
                  stavbaDruh: {
                    type: 'string',
                    title: 'Druh stavby',
                    default: 'Bytový dom',
                    enum: [
                      'Bytový dom',
                      'Rodinný dom',
                      'Iná budova na bývanie',
                      'Nebytová budova',
                      'Inžinierska stavba',
                      'Iné',
                    ],
                  },
                  stavbaUlica: {
                    type: 'string',
                    title: 'Ulica',
                  },
                  stavbaSupisneCislo: {
                    type: 'number',
                    title: 'Súpisné číslo',
                  },
                  stavbaParcela: {
                    title: 'Parcelné číslo',
                    description:
                      'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na katastrálnej mape ZBGIS.',
                    type: 'string',
                  },
                  stavbaKataster: {
                    title: 'Katastrálne územie',
                    type: 'array',
                    uniqueItems: true,
                    minItems: 1,
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'Čuňovo',
                          title: 'Čuňovo',
                        },
                        {
                          const: 'Devín',
                          title: 'Devín',
                        },
                        {
                          const: 'Devínska Nová Ves',
                          title: 'Devínska Nová Ves',
                        },
                        {
                          const: 'Dúbravka',
                          title: 'Dúbravka',
                        },
                        {
                          const: 'Jarovce',
                          title: 'Jarovce',
                        },
                        {
                          const: 'Karlova Ves',
                          title: 'Karlova Ves',
                        },
                        {
                          const: 'Lamač',
                          title: 'Lamač',
                        },
                        {
                          const: 'Nivy',
                          title: 'Nivy',
                        },
                        {
                          const: 'Nové Mesto',
                          title: 'Nové Mesto',
                        },
                        {
                          const: 'Petržalka',
                          title: 'Petržalka',
                        },
                        {
                          const: 'Podunajské Biskupice',
                          title: 'Podunajské Biskupice',
                        },
                        {
                          const: 'Rača',
                          title: 'Rača',
                        },
                        {
                          const: 'Rusovce',
                          title: 'Rusovce',
                        },
                        {
                          const: 'Ružinov',
                          title: 'Ružinov',
                        },
                        {
                          const: 'Staré mesto',
                          title: 'Staré mesto',
                        },
                        {
                          const: 'Trnávka',
                          title: 'Trnávka',
                        },
                        {
                          const: 'Vajnory',
                          title: 'Vajnory',
                        },
                        {
                          const: 'Vinohrady',
                          title: 'Vinohrady',
                        },
                        {
                          const: 'Vrakuňa',
                          title: 'Vrakuňa',
                        },
                        {
                          const: 'Záhorská Bystrica',
                          title: 'Záhorská Bystrica',
                        },
                      ],
                    },
                  },
                },
                required: [
                  'stavbaNazov',
                  'stavbaDruh',
                  'stavbaUlica',
                  'stavbaParcela',
                  'stavbaKataster',
                ],
              },
            },
            required: ['stavba'],
          },
        ],
      },
    },
  })

  await prisma.schema.update({
    where: {
      id: stanoviskoSchema.id,
    },
    data: {
      latestVersionId: stanoviskoSchemaVersion.id,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
