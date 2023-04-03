import { createParser } from '@opendesign/figma-parser'

import type { AbstractReader } from './abstract-reader.js'
import type { Logger, ICacher } from '@opendesign/figma-parser'
import type { DesignMeta, PageMeta } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import type { EventEmitter } from 'eventemitter3'

export type SourceApiReaderOptions = {
  /** Figma design HASH ID */
  designId: string
  host: string
  token: string
  ids: string[]
  pixelsLimit: number
  framePreviews: boolean
  tokenType: string
  previewsParallels: number
  nodesParallels: number
  s3Parallels: number
  verbose: boolean
  figmaIdsFetchUsedComponents: boolean
  renderImagerefs: boolean
  shouldObtainLibraries: boolean
  shouldObtainStyles: boolean
  parallelRequests: number
  logger?: Logger
  cacher?: ICacher
}

/**
 * Reader that downloads given design from Figma API and provide them through `EventEmitter` calls.
 */
export class SourceApiReader implements AbstractReader {
  private _options: SourceApiReaderOptions
  private _parser: ReturnType<typeof createParser>

  /**
   * Creates SourceApiReader that downloads given Figma designs from Figma API.
   * @constructor
   * @param {SourceApiReaderOptions} options
   */
  constructor(options: SourceApiReaderOptions) {
    this._options = options
    this._parser = this._initParser()
  }

  /**
   * Figma design hash.
   * Can be found in the URL of the design: `https://www.figma.com/file/__DESIGN_HASH__`
   * @returns {string} returns Figma design hash
   */
  get designId(): string {
    return this._options.designId
  }

  async getDesignMeta(): Promise<DesignMeta> {
    const fileMeta = await this._parser.getFileMeta()

    const artboards = fileMeta.content.topLevelArtboards.map((artboard) => ({
      name: artboard.name,
      id: artboard.id,
      role: 'ARTBOARD' as const,
    }))

    const localComponents = fileMeta.content.localComponents.map((localComponent) => ({
      name: localComponent.name,
      id: localComponent.id,
      role: 'COMPONENT' as const,
    }))

    const remoteComponents = fileMeta.content.remoteComponents.map((remoteComponent) => ({
      name: remoteComponent.name,
      id: remoteComponent.id,
      role: 'COMPONENT' as const,
    }))

    let pagesContainer = fileMeta.content.topLevelArtboards.reduce<{ [id: string]: PageMeta }>(
      (pagesContainer, artboard) => {
        const { page } = artboard
        if (!pagesContainer[page.id]) {
          pagesContainer[page.id] = {
            id: page.id,
            name: page.name,
            children: [],
          }
        }
        pagesContainer[page.id].children.push({ id: artboard.id, name: artboard.name, role: 'ARTBOARD' as const })

        return pagesContainer
      },
      {}
    )

    pagesContainer = fileMeta.content.localComponents.reduce<{ [id: string]: PageMeta }>(
      (pagesContainer, localComponent) => {
        const { page } = localComponent
        if (!pagesContainer[page.id]) {
          pagesContainer[page.id] = {
            id: page.id,
            name: page.name,
            children: [],
          }
        }
        pagesContainer[page.id].children.push({
          id: localComponent.id,
          name: localComponent.name,
          role: 'COMPONENT' as const,
        })

        return pagesContainer
      },
      pagesContainer
    )

    const pages = Object.values(pagesContainer)

    return {
      pages,
      components: [...artboards, ...localComponents, ...remoteComponents],
      name: fileMeta.designName,
      origin: {
        name: 'FIGMA',
        version: '0',
      },
    }
  }

  /**
   * Returns `EventEmitter` which is needed in OctopusFigConverter.
   * @param {string[]} [ids] Optional IDs of wanted artboards. If not provided, whole design will be parsed.
   * @returns {EventEmitter} returns `EventEmitter` providing source data to the OctopusFigConverter
   */
  getSourceDesign({ ids }: { ids?: string[] } = {}): EventEmitter {
    return this._parser.parse(ids)
  }

  private _initParser(): ReturnType<typeof createParser> {
    return createParser(this._options)
  }
}
