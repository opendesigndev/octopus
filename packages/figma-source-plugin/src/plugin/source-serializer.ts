/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer'

import { version } from '../../package.json'

const SECTION_TYPES = ['SECTION', 'COMPONENT_SET']
const CONTAINER_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE']
const SHAPE_TYPES = ['RECTANGLE', 'LINE', 'VECTOR', 'ELLIPSE', 'REGULAR_POLYGON', 'STAR', 'BOOLEAN_OPERATION']

type ImageMap = { [key: string]: string | undefined }
let imageMap: ImageMap = {}

async function nodeToObject(node: any) {
  const obj: any = { id: node.id, type: node.type }
  try {
    if (node.parent) obj.parent = { id: node.parent.id, type: node.parent.type }
    if (node.children) {
      const childrenPromises = node.children.map((child: any) => nodeToObject(child))
      obj.children = await Promise.all(childrenPromises)
    }
    const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__))
    const blacklist = ['parent', 'children', 'removed']
    for (const [name, prop] of props) {
      if (prop.get && !blacklist.includes(name)) {
        obj[name] = prop.get.call(node)
        if (typeof obj[name] === 'symbol') obj[name] = 'Mixed'
      }
    }
    if (node.fills?.length > 0) {
      for (const paint of node.fills) {
        if (paint.type === 'IMAGE') {
          const image = figma.getImageByHash(paint.imageHash)
          if (image?.hash && !imageMap[image.hash]) {
            const bytes = await image.getBytesAsync()
            imageMap[image.hash] = Buffer.from(bytes).toString('base64') // TODO for better perf try array buffer content (numbers) without converting it to base64. try also gzip
          }
        }
      }
    }
    if (node.type === 'TEXT') {
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
    if (node.masterComponent) obj.masterComponent = await nodeToObject(node.masterComponent)
  } catch (error) {
    console.info('ERROR', error)
    obj.ERROR = error
  }

  return obj // TODO add return type which is not any
}

export function getSelectedNodes(selection = figma.currentPage.selection): SceneNode[] {
  return selection.reduce((nodes: SceneNode[], node: SceneNode) => {
    if (node.visible === false) return nodes
    if (SECTION_TYPES.includes(node.type)) {
      const childNodes = getSelectedNodes((node as ChildrenMixin).children)
      return [...nodes, ...childNodes]
    }
    if ([...CONTAINER_TYPES, ...SHAPE_TYPES, 'TEXT'].includes(node.type)) return [...nodes, node]
    return nodes
  }, [])
}

export async function getSourceData() {
  imageMap = {} // clear imageMap

  const selectedPromises = getSelectedNodes().map((node) => nodeToObject(node))
  const selectedContent = await Promise.all(selectedPromises)
  if (!selectedContent.length) return null

  const document = { id: figma.root.id, name: figma.root.name }
  const currentPage = { id: figma.currentPage.id, name: figma.currentPage.name }
  const timestamp = new Date().toISOString()
  const assets = { images: imageMap }
  const context = { document, currentPage, selectedContent, assets }

  return { type: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE', version, timestamp, context }
}
