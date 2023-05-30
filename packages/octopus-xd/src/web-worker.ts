import type { SourceDesign } from './entities/source/source-design.js'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
importScripts('./octopus-xd-web.umd.js')

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { createConverter, XDFileReader } = OctopusXD

type RegisterFile = (msgId: number, buffer: ArrayBuffer) => void
type GetArtboards = (msgId: number, index: number) => void
type ParseArtboard = (msgId: number, index: number, artboardId: string) => void

type Handler = RegisterFile | GetArtboards | ParseArtboard

class OctopusXDWorker {
  private _lastIndex: number
  private _designs: { [key: string]: SourceDesign }

  constructor() {
    this._lastIndex = 0
    this._designs = {}
    this._initCommands()
  }

  private _initCommands() {
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

  private async _registerFile(msgId: number, buffer: ArrayBuffer) {
    const index = this._lastIndex++
    const reader = new XDFileReader({ file: new Uint8Array(buffer) })
    const sourceDesign = await reader.getSourceDesign()
    this._designs[index] = sourceDesign
    postMessage({ msgId, response: index })
  }

  private _getArtboards(msgId: number, index: number) {
    postMessage({ msgId, response: this._designs[index].artboards.map((artboard) => artboard.meta) })
  }

  private async _parseArtboard(msgId: number, index: number, artboardId: string) {
    const converter = createConverter({ sourceDesign: this._designs[index] })
    const result = await converter.convertArtboardByIdWithAssets(artboardId)
    postMessage({ msgId, response: result })
  }
}

new OctopusXDWorker()
