/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer'

import PQueue from 'p-queue'

const imageQueue = new PQueue({ concurrency: 6 })

const SECTION_TYPES = ['SECTION', 'COMPONENT_SET']
const CONTAINER_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE']
const SHAPE_TYPES = [
  'RECTANGLE',
  'LINE',
  'VECTOR',
  'ELLIPSE',
  'REGULAR_POLYGON',
  'STAR',
  'POLYGON',
  'BOOLEAN_OPERATION',
]
const TOP_NODE = true

type ImageMap = { [key: string]: string | undefined }

type MappedNode = {
  parent?: {
    id: string
    type: string
  }
  children?: MappedNode[]
  [key: string]: unknown
}

export type SourceDataOptions = {
  version: string
  exportPreviews?: boolean
}

export class SourceSerializer {
  imageMap: ImageMap
  previewMap: ImageMap
  exportPreviews = false
  version: string

  static getSelectedNodes(selection = figma.currentPage.selection): SceneNode[] {
    return selection.reduce((nodes: SceneNode[], node: SceneNode) => {
      if (node.visible === false) return nodes
      if (SECTION_TYPES.includes(node.type)) {
        const childNodes = this.getSelectedNodes((node as ChildrenMixin).children)
        return [...nodes, ...childNodes]
      }
      if ([...CONTAINER_TYPES, ...SHAPE_TYPES, 'TEXT'].includes(node.type)) return [...nodes, node]
      return nodes
    }, [])
  }

  constructor(options: SourceDataOptions) {
    this.version = options.version
    this.exportPreviews = options.exportPreviews ?? false
    this.imageMap = {}
    this.previewMap = {}
  }

  private async _traverseProps(node: SceneNode, obj: MappedNode): Promise<MappedNode> {
    if (node.parent) obj.parent = { id: node.parent.id, type: node.parent.type }
    if ((node as FrameNode).children) {
      const childrenPromises = (node as FrameNode).children.map((child) => this._nodeToObject(child))
      obj.children = await Promise.all(childrenPromises)
    }
    const props = Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(node))) as [
      string,
      Record<PropertyKey, unknown>
    ][]
    const blacklist = ['parent', 'children', 'removed']
    for (const [name, prop] of props) {
      if (prop.get && typeof prop.get === 'function' && !blacklist.includes(name)) {
        obj[name] = prop.get.call(node)
        if (typeof obj[name] === 'symbol') obj[name] = undefined
      }
    }
    return obj
  }

  private async _setImages(node: SceneNode) {
    const fills = ((node as GeometryMixin).fills as Paint[]) ?? []
    if (!fills.length) return
    for (const paint of fills) {
      if (paint.type !== 'IMAGE') continue
      const imageHash = paint.imageHash
      if (typeof imageHash !== 'string') continue
      const image = figma.getImageByHash(imageHash)
      if (image?.hash && !this.imageMap[image.hash]) {
        const bytes = await imageQueue.add(() => image.getBytesAsync())
        this.imageMap[image.hash] = Buffer.from(bytes).toString('base64')
      }
    }
  }

  private async _setPreview(node: SceneNode) {
    const bytes = await imageQueue.add(() =>
      node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })
    )
    this.previewMap[node.id] = Buffer.from(bytes).toString('base64')
  }

  private _setTextProps(node: SceneNode, obj: MappedNode) {
    if (node.type !== 'TEXT') return
    obj.styledTextSegments = node.getStyledTextSegments([
      'fontSize',
      'fontName',
      'fontWeight',
      'textDecoration',
      'textCase',
      'lineHeight',
      'letterSpacing',
      'fills',
      'textStyleId',
      'fillStyleId',
      'listOptions',
      'indentation',
      'hyperlink',
    ])
  }

  private async _nodeToObject(node: SceneNode, isTopNode = false): Promise<MappedNode> {
    const obj: MappedNode = { id: node.id, type: node.type }
    try {
      await this._traverseProps(node, obj)
      await this._setImages(node)
      if (this.exportPreviews && isTopNode) await this._setPreview(node)
      await this._setTextProps(node, obj)
    } catch (error) {
      console.info('ERROR', error)
      obj.ERROR = error
    }
    return obj
  }

  async getSourceData() {
    const selectedPromises = SourceSerializer.getSelectedNodes().map((node) => this._nodeToObject(node, TOP_NODE))
    const selectedContent = await Promise.all(selectedPromises)
    if (!selectedContent.length) return null

    const document = { id: figma.root.id, name: figma.root.name, fileKey: figma.fileKey }
    const currentPage = { id: figma.currentPage.id, name: figma.currentPage.name }
    const timestamp = new Date().toISOString()
    const assets = { images: this.imageMap, previews: this.previewMap }
    const context = { document, currentPage, selectedContent, assets }
    const version = this.version

    return { type: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE', version, timestamp, context }
  }
}
