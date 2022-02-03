import readPackageUpAsync from 'read-pkg-up'

import {Logger} from './typings'
import createLogger from './services/general/default-logger'
import ArtboardConverter from './services/conversion/artboard-converter'
import type { ArtboardConversionOptions } from './services/conversion/artboard-converter'

import type { NormalizedReadResult } from 'read-pkg-up'

type OctopusAIConverterOptions = {
    logger?: Logger
  }
  

export default class OctopusAIConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
    private _logger: Logger

    constructor(options?: OctopusAIConverterOptions) {
      this._pkg = readPackageUpAsync({ cwd: __dirname })
        this._logger = options?.logger || createLogger()

    }

    get logger() {
        return this._logger
      }
    
      get pkg() {
        return this._pkg.then(normalized => {
          if (!normalized) {
            throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
          }
          return normalized.packageJson
        })
      }
      
      convertArtboardById(options: ArtboardConversionOptions) {
        return new ArtboardConverter({
          ...options,
          octopusAIConverter: this
        }).convert()
      }

}