import fs from 'fs/promises'
import path from 'path'

import { default as pkg } from './package.json' assert { type: 'json' }

const RELEASE_DIR = './release'

const RELEASE_PROPS = {
  // As we have custom release process, we need to make sure that all the files from release dir are included in the package.
  // Files property in package.json whitelists files that are included in the package. We want all the files from release dir.
  files: undefined,
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
