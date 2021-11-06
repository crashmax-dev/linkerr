import fs from 'fs'
import got from 'got'
import path from 'path'
import ParseHTML from './parse-html.js'
import isValidUrl from './valid-url.js'

export interface LinkerrData {
  target: string
  href: string[]
  img: string[]
  script: string[]
  link: string[]
}

export default class Linkerr {
  #url: URL | null = null
  #outputData: LinkerrData | null = null
  #parsedBody: string | null = null

  get data(): LinkerrData | null {
    return this.#outputData
  }

  get url(): URL | null {
    return this.#url
  }

  async parse(url: string): Promise<LinkerrData> {
    const parsedURL = isValidUrl(url, {
      lenient: true
    })

    if (parsedURL) {
      this.#url = parsedURL

      try {
        const { body } = await got(this.#url)
        this.#parsedBody = body
      } catch (err) {
        throw new TypeError(`${err}`)
      }

      const html = new ParseHTML(
        this.#parsedBody,
        this.#url.origin
      )

      this.#outputData = {
        target: this.#url.href,
        href: html.parse('a', 'href'),
        img: html.parse('img', 'src'),
        script: html.parse('script', 'src'),
        link: html.parse('link', 'href')
      }

      return this.#outputData
    } else {
      throw new TypeError('URL is not valid!')
    }
  }

  async save(
    { outputPath, fileName }: { outputPath: string, fileName: string }
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.#outputData) {
        throw new TypeError('Output data is not found!')
      }

      const savePath = path.format({
        dir: outputPath,
        base: fileName
      })

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath)
      }

      fs.writeFile(
        savePath,
        JSON.stringify(this.#outputData, null, 2),
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }
}