interface IFetchOptions {
  type: string
  id?: string
  action?: string
}

type IResultFileType = 'json' | 'csv'

export interface FetchOpenDataResult {
  data: IJSONFile[] // TODO IJSONFile[] || ICSVFile[] ??
}

interface IDataset {
  id: string
  name: string
  slug: string
}

interface IDatasetFile {
  id: string
  name: string
  type: string
}

interface IJSONFile {
  name: string
  jsonData: JSONData
}

type JSONData = Record<string, any>

class OpenDataClient {
  private readonly apiKey?: string

  private readonly cache: Record<string, any>

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey
    this.cache = {}
  }

  getCyclingData = async (resultFileType: IResultFileType = 'json') => {
    return this.getData({
      categorySlug: 'doprava',
      datasetSlug: 'cykloscitace-bratislava',
      resultFileType,
    })
  }

  private getData = async ({
    categorySlug,
    datasetSlug,
    resultFileType,
  }: {
    categorySlug: string
    datasetSlug: string
    resultFileType: IResultFileType
  }) => {
    try {
      // Firstly fetch the id of the right category based on categorySlug
      const category = await this.fetchCategory(categorySlug)

      if (!category) throw new Error(`Category ${categorySlug} not found`)

      // Then fetch the id of the right dataset based on datasetSlug and categoryId
      const dataset = await this.fetchDataset(datasetSlug, category.id)

      if (!dataset) throw new Error(`Data set ${datasetSlug} not found`)

      // Then fetch all the files from this dataset
      const datasetFiles = await this.fetchDatasetFiles(dataset.id)

      if (datasetFiles.length === 0) throw new Error(`Data set with id ${dataset.id} has no files`)

      // Then download all JSON files from this dataset
      const resultData = await this.downloadAllFiles(datasetFiles, resultFileType)

      return {
        data: resultData,
      } as FetchOpenDataResult
    } catch (error) {
      throw new Error(`OpenDataClient error while getting data: ${String(error)}`)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getCacheKey = ({ type, id, action }: IFetchOptions) => `${type}@${id}@${action}`

  private handleFetch = async <T>({ type, id, action }: IFetchOptions): Promise<T> => {
    if (!this.apiKey) {
      throw new Error('Invalid API Key')
    }

    const cacheKey = this.getCacheKey({ type, id, action })
    const cacheData = this.cache[cacheKey]
    if (cacheData) {
      return cacheData
    }

    const slugs = [type, id, action]
    const params = slugs.filter(Boolean).join('/')

    const url = `https://opendata.bratislava.sk/api/${params}`

    const res = await fetch(url, {
      headers: {
        key: this.apiKey,
      },
    })

    if (res.status >= 300) {
      throw new Error(
        `Problem with server communication [status:${res.status}] [params: type:${type} id:${id} action:${action}]`
      )
    }

    const data = await res.json()

    this.cache[cacheKey] = data

    return data
  }

  private fetchCategory = async (slug: string) => {
    const data = await this.handleFetch<{ categories: IDataset[] }>({
      type: 'category',
    })

    return data.categories.find((category) => category.slug === slug)
  }

  private fetchDataset = async (slug: string, categoryId: string) => {
    const data = await this.handleFetch<{ datasets: IDataset[] }>({
      type: 'category',
      id: categoryId,
      action: 'datasets',
    })

    return data.datasets.find((dataset) => dataset.slug === slug)
  }

  private fetchDatasetFiles = async (datasetId: string) => {
    const data = await this.handleFetch<{ files: IDatasetFile[] }>({
      type: 'dataset',
      id: datasetId,
      action: 'files',
    })

    return data.files
  }

  private downloadAllFiles = async (datasetFiles: IDatasetFile[], resultFileType: IResultFileType) => {
    const downloadedFiles: IJSONFile[] = []

    for (const file of datasetFiles) {
      if (file.type === resultFileType) {
        const data = await this.handleFetch<JSONData>({
          type: 'file',
          id: file.id,
          action: 'download',
        })

        downloadedFiles.push({ name: file.name, jsonData: data })
      }
    }

    return downloadedFiles
  }
}

const client = new OpenDataClient(process.env.OPEN_DATA_API_KEY)

export default client
