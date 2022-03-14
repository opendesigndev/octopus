import os from 'os'
import path from 'path'
import { promises as fsp } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { detachPromiseControls } from '@avocode/octopus-common/dist/utils'
import type { Exporter } from '.'

export class LocalExporter implements Exporter {
  _outputDir: Promise<string>
  _assetsSaves: Promise<unknown>[]

  private async _initTempDir(options: LocalExporterOptions) {
    const tempFallback = path.join(os.tmpdir(), uuidv4())
    const dir = typeof options.path === 'string' ? options.path : tempFallback
    //@todo: add images
    // await fsp.mkdir(path.join(dir, LocalExporter.IMAGES_DIR_NAME), { recursive: true })
    return dir
  }

  private async _save(name: string | null, body: string | Buffer) {
    const dir = await this._outputDir
    const fullPath = path.join(dir, typeof name === 'string' ? name : uuidv4())
    await fsp.writeFile(fullPath, body)
    return fullPath
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }
}
