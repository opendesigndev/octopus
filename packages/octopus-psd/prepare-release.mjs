import fs from 'fs/promises'
import path from 'path'

import tar from 'tar'

import { default as pkg } from './package.json' assert { type: 'json' }

const RELEASE_DIR = './release'

const RELEASE_PROPS = {
  files: [
    // es, node
    'index.mjs',
    'index.d.mts',

    // es, web
    'index-web.mjs',
    'index-web.d.mts',

    // cjs
    'index.js',
    'index.d.ts',
  ],
  module: './index.mjs',
  main: './index.js',
  exports: {
    '.': {
      node: {
        require: './index.js',
        import: './index.mjs',
        types: './index.d.ts',
      },
      default: {
        import: './index-web.mjs',
        types: './index-web.d.mts',
      },
    },
  },
  type: undefined,
}

function prepareReleaseDir() {
  return fs.mkdir(RELEASE_DIR, { recursive: true })
}

function preparePublicPackageJSON() {
  return fs.writeFile(path.join(RELEASE_DIR, 'package.json'), JSON.stringify({ ...pkg, ...RELEASE_PROPS }, null, 2))
}

async function packFiles() {
  const content = await fs.readdir(RELEASE_DIR)
  return tar.c(
    {
      gzip: true,
      file: 'release.tgz',
      cwd: RELEASE_DIR,
      prefix: 'package',
    },
    content.map((file) => `./${file}`)
  )
}

function copyDMTStoDTS() {
  return fs.copyFile(path.join(RELEASE_DIR, 'index.d.mts'), path.join(RELEASE_DIR, 'index.d.ts'))
}

async function release() {
  await prepareReleaseDir()
  await preparePublicPackageJSON()
  await copyDMTStoDTS()
  await packFiles()
}

release()
