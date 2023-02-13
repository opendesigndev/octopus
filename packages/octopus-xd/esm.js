/* eslint-disable @typescript-eslint/no-var-requires */
const { promises: fs } = require('fs')
const path = require('path')

const [TS_CONFIG_LOCATION] = process.argv.slice(2)

async function getTSConfig() {
  return JSON.parse((await fs.readFile(TS_CONFIG_LOCATION)).toString())
}

async function createESMReexport(dir, file) {
  const filePath = path.join(dir, `${file}.mjs`)
  const payload = `export * from './${file}.js'`
  return fs.writeFile(filePath, payload)
}

async function createESMTypes(dir, file) {
  const from = path.join(dir, `${file}.d.ts`)
  const to = path.join(dir, `${file}.d.mts`)
  return fs.copyFile(from, to)
}

async function createESMEntryPoint(dir, file) {
  await createESMReexport(dir, file)
  await createESMTypes(dir, file)
}

async function createESMEntryPoints(subDir) {
  const conf = await getTSConfig()
  const distPath = conf.compilerOptions.outDir
  const dir = path.join(distPath, subDir)
  const files = await fs.readdir(dir, { withFileTypes: true })
  const indexFiles = files
    .filter((file) => {
      return file.isFile() && /^index(?:-.*)?\.js$/.test(file.name)
    })
    .map((file) => {
      return file.name.replace(/\.js$/i, '')
    })
  for (const file of indexFiles) {
    console.info(`Creating ESM entrypoints (${file})...`)
    await createESMEntryPoint(dir, file)
  }
}

async function build(subDir = 'src') {
  await createESMEntryPoints(subDir)
}

build()
