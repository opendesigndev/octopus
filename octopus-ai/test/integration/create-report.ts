import fs from 'fs'

import handlebars from 'handlebars'

import type { Fail } from './services/tester'

export function createReport(failed: Fail[]): string {
  const source = fs.readFileSync(`${__dirname}/report/report-template.hbs`).toString()

  const template = handlebars.compile(source)

  const context = {
    failed,
  }
  const html = template(context)

  return html
}
