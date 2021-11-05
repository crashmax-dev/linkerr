import { parse as parseBody } from 'node-html-parser'

export default class ParseHTML {
  #body: string
  #url: string

  constructor(body: string, url: string) {
    this.#body = body
    this.#url = url
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
    const body = parseBody(this.#body)
    const elements = body.querySelectorAll(selector)

    return elements.reduce((acc: string[], element) => {
      let attributeValue = element.attributes[attribute]

      if (!!attributeValue) {
        if (this.#isURLAttribute(attribute)) {
          attributeValue = this.#addHostToLink(this.#url, attributeValue)
        }

        acc.push(decodeURI(attributeValue))
      }

      return acc
    }, [])
  }
}