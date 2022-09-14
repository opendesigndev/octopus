import fs from 'fs'

import handlebars from 'handlebars'

import type { Fail } from './tester'

export function createReport(failed: Fail[]) {
  const source = fs.readFileSync(`${__dirname}/report/report-template.hbs`).toString()
  const jsondiffStyle = fs
    .readFileSync(`${process.cwd()}/node_modules/jsondiffpatch/dist/formatters-styles/html.css`)
    .toString()
  const template = handlebars.compile(source)
  const context = {
    jsondiffStyle,
    failed,
  }
  const html = template(context)

  fs.writeFileSync(`${process.cwd()}/test/integration/report/test-report.html`, html)
}
