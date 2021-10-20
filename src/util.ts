import URLParse from 'url-parse'

export const isURLAttribute = (attribute: string) => {
  return attribute === 'src' || attribute === 'href'
}

export function parseURL(url: string) {
  return new URLParse(url)
}

export function addHostnameToLink(host: string, link: string) {
  if (link[0] === '/' || link[0] === '#') {
    return host + link
  }

  return link
}

export function getCurrentDate() {
  const currentDate = new Date()
  const date = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_${currentDate.getDate()}-${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`

  return date
}