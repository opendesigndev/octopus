import {Logger} from './typings'
import createLogger from './services/general/default-logger'

type OctopusAIConverterOptions = {
    logger?: Logger
  }
  

export default class OctopusAIConverter {
    private _logger: Logger

    constructor(options?: OctopusAIConverterOptions) {
        this._logger = options?.logger || createLogger()

    }

    get logger() {
        return this._logger
      }
}