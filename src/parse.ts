import type URLParse from 'url-parse'
import { parse as parseBody } from 'node-html-parser'

export default class ParseBody {
  #rawBody: string
  #parsedUrl: URLParse

  constructor(rawBody: string, parsedUrl: URLParse) {
    this.#rawBody = rawBody
    this.#parsedUrl = parsedUrl
  }

  #isURLAttribute(attribute: string): boolean {
    return attribute === 'src' || attribute === 'href'
  }

  #addHostToLink(host: string, link: string): string {
    if (link[0] === '/' || link[0] === '#') {
      if (link[0] !== '/') {
        return host + '/' + link
      }

      return host + link
    }

    if (link.indexOf('://') < 0) {
      return host + '/' + link
    }

    return link
  }

  parse(selector: string, attribute: string): string[] {
    const body = parseBody(this.#rawBody)
    const elements = body.querySelectorAll(selector)

    return elements.reduce((acc: string[], element) => {
      let attributeValue = element.attributes[attribute]

      if (!!attributeValue) {
        if (this.#isURLAttribute(attribute)) {
          attributeValue = this.#addHostToLink(this.#parsedUrl.origin, attributeValue)
        }

        acc.push(attributeValue)
      }

      return acc
    }, [])
  }
}