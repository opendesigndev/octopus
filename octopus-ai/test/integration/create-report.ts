import fs from 'fs'
import path from 'path'

import handlebars from 'handlebars'

import type { Fail } from './services/tester'

export function createReport(failed: Fail[]): string {
  const source = fs.readFileSync(path.join(__dirname, '/report/report-template.hbs')).toString()

  const template = handlebars.compile(source)

  const context = {
    failed,
  }
  const html = template(context)

  return html
}
