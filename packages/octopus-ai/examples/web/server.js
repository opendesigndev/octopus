import http from 'http'

import fs from 'fs'

const port = 3000

fs.readFile('./examples/web/index-api.html', function (err, html) {
  if (err) throw err
  console.log('___html', html.toString())
  http
    .createServer(function (request, response) {
      response.writeHeader(200, { 'Content-Type': 'text/html' })
      response.write(html.toString())
      response.end()
    })
    .listen(port)
})
