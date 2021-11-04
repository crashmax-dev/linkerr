import fs from 'fs'
import got from 'got'
import path from 'path'
import URLParse from 'url-parse'
import ParseBody from './parse.js'

export interface LinkerrData {
  target: string
  href: string[]
  img: string[]
  script: string[]
  link: string[]
}

export default class Linkerr {
  #parsedUrl: URLParse | null = null
  #outputData: LinkerrData | null = null
  #rawBody: string | null = null

  async parse(url: string): Promise<LinkerrData> {
    this.#parsedUrl = new URLParse(url)

    if (this.#parsedUrl.protocol) {
      try {
        this.#rawBody = (await got(this.#parsedUrl.href)).body
      } catch (err) {
        throw err
      }

      const { parse } = new ParseBody(
        this.#rawBody,
        this.#parsedUrl
      )

      this.#outputData = {
        target: this.#parsedUrl.href,
        href: parse('a', 'href'),
        img: parse('img', 'src'),
        script: parse('script', 'src'),
        link: parse('link', 'href')
      }

      return this.#outputData
    } else {
      throw Error('URL is not valid!')
    }
  }

  async save(
    { outputPath, fileName }: { outputPath: string, fileName: string }
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.#outputData) {
        reject('Body is not found!')
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