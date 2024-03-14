import React from 'react'
import * as cheerio from 'cheerio'
import ReactDOMServer from 'react-dom/server'
import { E2eSequenceForm } from './E2eSequenceForm'
import { rjsfValidator } from '../../../frontend/utils/form'

interface Field {
  action: 'field'
  id: string
  type: string
  value: any
}

interface ArrayField {
  action: 'array'
  id: string
  length: number
}

interface StepField {
  action: 'goToStep'
  name: string
}

function parseHtml(html: string): (Field | ArrayField | StepField)[] {
  const $ = cheerio.load(html, { xml: true })
  const fields: (Field | ArrayField | StepField)[] = []

  $('e2e-sequence > *').each((_, element) => {
    const tagName = $(element).prop('tagName').toLowerCase()

    if (tagName === 'step') {
      const name = $(element).attr('name')
      if (name) {
        fields.push({ action: 'goToStep', name })
      }
    } else if (tagName === 'field') {
      const id = $(element).attr('id')
      const type = $(element).attr('type')
      const value = $(element).attr('value')

      if (id && type) {
        try {
          fields.push({
            action: 'field',
            id,
            type,
            value: value === undefined ? undefined : JSON.parse(value),
          })
        } catch (error) {
          throw new Error(`Failed to parse JSON value for field with id "${id}"`)
        }
      }
    } else if (tagName === 'array') {
      const id = $(element).attr('id')
      const length = $(element).attr('length')

      if (id && length) {
        fields.push({
          action: 'array',
          id,
          length: parseInt(length, 10),
        })
      }
    }
  })

  return fields
}

export const getE2eSequence = ({
  jsonSchema,
  uiSchema,
  data,
}: {
  jsonSchema: any
  uiSchema: any
  data: any
}) => {
  const renderedString = ReactDOMServer.renderToString(
    <E2eSequenceForm
      schema={JSON.parse(JSON.stringify(jsonSchema))}
      uiSchema={uiSchema}
      formData={data}
      validator={rjsfValidator}
      tagName="e2e-sequence"
    >
      <></>
    </E2eSequenceForm>,
  )

  return parseHtml(renderedString)
}
