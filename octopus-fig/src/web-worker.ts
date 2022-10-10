import type { OctopusFigConverter } from './octopus-fig-converter'
import type { SourceApiReader as SrcApiReader, SourceApiReaderOptions } from './services/readers/source-api-reader'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
importScripts('./octopus-fig-web.umd.js')

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { createConverter, SourceApiReader } = OctopusFig

type RegisterFile = (msgId: number, buffer: ArrayBuffer) => void
type GetArtboards = (msgId: number, index: number) => void
type ParseArtboard = (msgId: number, index: number, artboardId: string) => void

type Handler = RegisterFile | GetArtboards | ParseArtboard

class OctopusFigWorker {
  _lastIndex: number
  _readers: { [key: string]: SrcApiReader }

  constructor() {
    this._lastIndex = 0
    this._readers = {}
    this._initCommands()
  }

  _initCommands() {
    const handlers: { [key: string]: Handler } = {
      'register-file': this._registerFile.bind(this),
      'get-artboards': this._getArtboards.bind(this),
      'parse-artboard': this._parseArtboard.bind(this),
    }
    addEventListener('message', function ({ data }) {
      const { type, args } = Object(data)
      const handlerArgs = args as Parameters<Handler>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (type in handlers) handlers[type](...handlerArgs)
    })
  }

  async _registerFile(msgId: number, options: SourceApiReaderOptions) {
    const index = this._lastIndex++
    const reader = new SourceApiReader(options)
    this._readers[index] = reader
    postMessage({ msgId, response: index })
  }

  async _getArtboards(msgId: number, index: number) {
    postMessage({ msgId, response: await this._readers[index].getFileMeta })
  }

  async _parseArtboard(msgId: number, index: number, artboardId: string) {
    const converter = createConverter() as OctopusFigConverter
    const result = await converter.convertDesign({ designEmitter: this._readers[index].parse([artboardId]) })
    postMessage({ msgId, response: result })
  }
}

new OctopusFigWorker()
