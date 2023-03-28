import fs from 'fs/promises'
import path from 'path'

import { default as pkg } from './package.json' assert { type: 'json' }

const RELEASE_DIR = './release'

const RELEASE_PROPS = {
  files: [
    // types
    'index-node.d.ts',
    'index-web.d.ts',

    // es, node
    'index.mjs',
    'index.d.mts',

    // es, web
    'web.mjs',
    'web.d.mts',

    // cjs
    'index.js',
    'index.d.ts',
  ],
  module: './index.mjs',
  main: './index.js',
  exports: undefined,
  type: undefined,
}

function prepareReleaseDir() {
  return fs.mkdir(RELEASE_DIR, { recursive: true })
}

function preparePublicPackageJSON() {
  return fs.writeFile(path.join(RELEASE_DIR, 'package.json'), JSON.stringify({ ...pkg, ...RELEASE_PROPS }, null, 2))
}

function copyDMTStoDTS() {
  return fs.copyFile(path.join(RELEASE_DIR, 'index.d.mts'), path.join(RELEASE_DIR, 'index.d.ts'))
}

async function release() {
  await prepareReleaseDir()
  await preparePublicPackageJSON()
  await copyDMTStoDTS()
}

release()
