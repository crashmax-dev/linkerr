export default function isValidUrl(url: string, { lenient = false } = {}): URL | false {
  url = url.trim()
  if (url.includes(' ')) {
    return false
  }

  try {
    return new URL(url)
  } catch {
    if (lenient) {
      return isValidUrl(`https://${url}`)
    }

    return false
  }
}