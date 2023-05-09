import { ChangeEvent } from 'react'

export const readTextFile = (event: ChangeEvent<HTMLInputElement>): Promise<string> => {
  return new Promise((resolve, reject) => {
    event.preventDefault()

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.addEventListener('error', reject)
    if (event.target.files?.[0]) {
      reader.readAsText(event.target.files[0])
    }
  })
}
