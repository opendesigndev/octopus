import readPackageUpAsync from 'read-pkg-up'

import ArtboardConverter from './services/conversion/artboard-converter/index.js'
import createLogger from './services/general/default-logger/index.js'

import type { ArtboardConversionOptions } from './services/conversion/artboard-converter/index.js'
import type { Logger } from './typings/index.js'
import type { Octopus } from './typings/octopus/index.js'
import type { NormalizedReadResult, NormalizedPackageJson } from 'read-pkg-up'

type OctopusAIConverterOptions = {
  logger?: Logger
}

export default class OctopusAIConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _logger: Logger

  constructor(options?: OctopusAIConverterOptions) {
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._logger = options?.logger ?? createLogger()
  }

  get pkg(): Promise<NormalizedPackageJson> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  convertArtboardById(options: ArtboardConversionOptions): Promise<Octopus['OctopusDocument']> {
    return new ArtboardConverter({
      ...options,
      octopusAIConverter: this,
    }).convert()
  }
}
