#!/usr/bin/env node
import ora from 'ora'
import chalk from 'chalk'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Command } from 'commander'
import { parseURL } from './util.js'
import Linkerr, { getCurrentDate } from './linkerr.js'

(async () => {
  const spinner = ora()
  const program = new Command()
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const exit = (code: number) => process.exit(code)

  program
    .name('linkerr')
    .option('-u, --url [url]', 'target url')
    .option('-o, --output [path]', 'output path')
    .option('-f, --fileName [name]', 'output file name')
    .parse(process.argv)

  const options = program.opts()

  if (!options.url) {
    console.log('Please, specify the URL for parsing\n')
    program.help()
    exit(0)
  }

  const parsedUrl = parseURL(options.url)

  if (parsedUrl) {
    const linkerr = new Linkerr()
    const url = parsedUrl.origin
    spinner.start(`Starting parse ${url}`)

    try {
      const outputPath = path.join(__dirname, options.output || '/output')
      const fileName = (options.fileName || parsedUrl.hostname + '_' + getCurrentDate()) + '.json'

      await linkerr.parse(parsedUrl.href)
      await linkerr.saveFile({ outputPath, fileName })

      spinner.succeed(`Page ${chalk.green(url)} have been parsed`)
      spinner.succeed(`Data saved at ${chalk.cyan(path.join(outputPath, fileName))}`)
    } catch (err) {
      spinner.fail(err.message)
      exit(2)
    }
  } else {
    spinner.fail('URL is not valid!')
    exit(1)
  }
})()