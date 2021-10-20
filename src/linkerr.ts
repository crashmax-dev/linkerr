import fs from 'fs'
import got from 'got'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import URLParse from 'url-parse'
import { parse as parseBody } from 'node-html-parser'
import { parseURL, addHostnameToLink, isURLAttribute, getCurrentDate } from './util.js'

export interface LinkerrData {
  target: string
  href: string[]
  img: string[]
  script: string[]
  link: string[]
}

interface LinkerrSaveData {
  outputPath: string
  fileName: string
  data?: LinkerrData
}

export { getCurrentDate }
export default class Linkerr {
  public url: URLParse | undefined
  public data: LinkerrData | undefined
  public body: string | undefined

  async parse(url: string) {
    const parsedUrl = parseURL(url)

    if (parsedUrl.protocol) {
      this.url = parsedUrl
      const { body } = await got(parsedUrl.href)
      this.body = body

      this.data = {
        target: this.url.href,
        href: this.parseAttribute('a', 'href'),
        img: this.parseAttribute('img', 'src'),
        script: this.parseAttribute('script', 'src'),
        link: this.parseAttribute('link', 'href')
      }

      return this.data
    } else {
      throw Error('URL is not valid!')
    }
  }

  private parseAttribute(selector: string, attribute: string) {
    const body = parseBody(this.body)
    const elements = body.querySelectorAll(selector)

    return elements.reduce((acc, element) => {
      let attributeValue = element.attributes[attribute]

      if (!!attributeValue) {
        if (isURLAttribute(attribute)) {
          attributeValue = addHostnameToLink(this.url.origin, attributeValue)
        }

        acc.push(attributeValue)
      }

      return acc
    }, [])
  }

  public async saveFile({ outputPath, fileName, data = this.data }: LinkerrSaveData) {
    return new Promise<void>((resolve, reject) => {
      if (!data) {
        reject('Data is not found!')
      }

      const savePath = path.format({
        dir: outputPath,
        base: fileName
      })

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath)
      }

      fs.writeFile(savePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}