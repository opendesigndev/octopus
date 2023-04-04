/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer'

const SECTION_TYPES = ['SECTION', 'COMPONENT_SET']
const CONTAINER_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE']
const SHAPE_TYPES = ['RECTANGLE', 'LINE', 'VECTOR', 'ELLIPSE', 'REGULAR_POLYGON', 'STAR', 'BOOLEAN_OPERATION']
const TOP_NODE = true

type ImageMap = { [key: string]: string | undefined }

type FigmaNode<T> = {
  parent?: {
    id: string
    type: string
  }
  children?: T[]
}

type MappedNode<T> = {
  parent?: {
    id: string
    type: string
  }
  children?: T[]
  [key: string]: unknown
}

export type SourceDataOptions = {
  version: string
  exportPreviews?: boolean
}

export class SourceSerializer {
  imageMap: ImageMap = {}
  previewMap: ImageMap = {}
  exportPreviews = false

  private async _traverseProps<T, U>(node: FigmaNode<T>, obj: MappedNode<U>): Promise<MappedNode<U>> {
    if (node.parent) obj.parent = { id: node.parent.id, type: node.parent.type }
    if (node.children) {
      const childrenPromises = node.children.map((child) => this._nodeToObject<U>(child))
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

  private async _setImages(node: any) {
    if (!node.fills?.length) return
    for (const paint of node.fills) {
      if (paint.type !== 'IMAGE') continue
      const image = figma.getImageByHash(paint.imageHash)
      if (image?.hash && !this.imageMap[image.hash]) {
        const bytes = await image.getBytesAsync()
        this.imageMap[image.hash] = Buffer.from(bytes).toString('base64') // TODO for better perf try array buffer content (numbers) without converting it to base64. try also gzip
      }
    }
  }

  private async _setPreview(node: any) {
    const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })
    this.previewMap[node.id] = Buffer.from(bytes).toString('base64')
  }

  private _setTextProps(node: any, obj: any) {
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

  private async _setMasterComponent(node: any, obj: any) {
    if (node.masterComponent) obj.masterComponent = await this._nodeToObject(node.masterComponent)
  }

  private async _nodeToObject<T>(node: any, isTopNode = false): Promise<T> {
    const obj: any = { id: node.id, type: node.type }
    try {
      await this._traverseProps(node, obj)
      await this._setImages(node)
      if (this.exportPreviews && isTopNode) await this._setPreview(node)
      await this._setTextProps(node, obj)
      await this._setMasterComponent(node, obj)
    } catch (error) {
      console.info('ERROR', error)
      obj.ERROR = error
    }
    return obj // TODO add return type which is not any
  }

  getSelectedNodes(selection = figma.currentPage.selection): SceneNode[] {
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

  async getSourceData({ version, exportPreviews }: SourceDataOptions) {
    this.imageMap = {} // clear imageMap
    this.previewMap = {} // clear previewMap
    this.exportPreviews = exportPreviews ?? false

    const selectedPromises = this.getSelectedNodes().map((node) => this._nodeToObject(node, TOP_NODE))
    const selectedContent = await Promise.all(selectedPromises)
    if (!selectedContent.length) return null

    const document = { id: figma.root.id, name: figma.root.name, fileKey: figma.fileKey }
    const currentPage = { id: figma.currentPage.id, name: figma.currentPage.name }
    const timestamp = new Date().toISOString()
    const assets = { images: this.imageMap, previews: this.previewMap }
    const context = { document, currentPage, selectedContent, assets }

    return { type: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE', version, timestamp, context }
  }
}
