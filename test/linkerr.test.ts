import fs from 'fs'
import test from 'ava'
import Linkerr from '../src/linkerr.js'

const EXAMPLE_HOSTNAME = 'https://example.com/'
const GITHUB_HOSTNAME = 'https://github.com/'

test(`check the data obtained from ${EXAMPLE_HOSTNAME}`, async (to) => {
  const linkerr = new Linkerr()
  const { href, target, link, img, script } = await linkerr.parse(EXAMPLE_HOSTNAME)
  to.is(href[0], 'https://www.iana.org/domains/example')
  to.is(target, EXAMPLE_HOSTNAME)
  to.deepEqual(link, [])
  to.deepEqual(img, [])
  to.deepEqual(script, [])
})

test(`save the data after receiving them from ${GITHUB_HOSTNAME}`, async (to) => {
  const currentTime = Date.now()
  const linkerr = new Linkerr()
  await linkerr.parse(GITHUB_HOSTNAME)
  await linkerr.save({ outputPath: 'test', fileName: `${currentTime}.json` })
  to.notThrows(() => fs.readFileSync(`test/${currentTime}.json`))
})

test(`trying to save data before it is received`, async (to) => {
  const currentTime = Date.now()
  const linkerr = new Linkerr()
  const fn = async () => await linkerr.save({ outputPath: 'test', fileName: `${currentTime}.json` })
  const error = await to.throwsAsync(fn(), { instanceOf: TypeError })
  to.is(error.message, 'Output data is not found!')
})

test(`throw invalid url`, async (to) => {
  const linkerr = new Linkerr()
  const fn = async () => await linkerr.parse('invalid url')
  const error = await to.throwsAsync(fn(), { instanceOf: TypeError })
  to.is(error.message, 'URL is not valid!')
})