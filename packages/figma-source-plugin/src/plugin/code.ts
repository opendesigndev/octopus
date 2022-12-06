/* eslint-disable @typescript-eslint/no-explicit-any */

import { Buffer } from 'buffer'

// import { version } from '../../package.json'

import { dispatch, handleEvent } from './message-handler'

const version = '1.0.0' // TODO

figma.showUI(__html__, { height: 360, width: 300 })
figma.skipInvisibleInstanceChildren = true // skip invisible nodes for faster performance

type ImageMap = { [key: string]: string | undefined }
let imageMap: ImageMap = {}

// CONSTANTS
const FULL_SCAN = true
const QUICK_SCAN = false

const getSelectedContent = async (isFullScan = false): Promise<any[]> => {
  const selectedPromises = figma.currentPage.selection.map((node) => nodeToObject(node, isFullScan))
  return Promise.all(selectedPromises)
}

const getSource = async (isFullScan = false) => {
  imageMap = {} // clear imageMap

  const selectedContent = await getSelectedContent(isFullScan)
  if (!selectedContent.length) return null

  const document = { id: figma.root.id, name: figma.root.name }
  const currentPage = { id: figma.currentPage.id, name: figma.currentPage.name }
  const timestamp = new Date().toISOString()
  const assets = { images: imageMap }
  const context = { document, currentPage, selectedContent, assets }

  return { type: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE', version, timestamp, context }
}

const getSelectedObjectsCount = async (): Promise<number> => {
  const selectedContent = await getSelectedContent(QUICK_SCAN)
  return selectedContent.length
}

const nodeToObject = async (node: any, isFullScan = false) => {
  const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__))
  const blacklist = ['parent', 'children', 'removed']

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = { id: node.id, type: node.type }
  if (node.parent) obj.parent = { id: node.parent.id, type: node.type }
  if (isFullScan && node.children)
    obj.children = await Promise.all(node.children.map((child: any) => nodeToObject(child, isFullScan)))
  for (const [name, prop] of props) {
    if (prop.get && blacklist.indexOf(name) < 0) {
      obj[name] = prop.get.call(node)
      if (typeof obj[name] === 'symbol') obj[name] = 'Mixed'
    }
  }
  if (isFullScan && node.fills?.length > 0) {
    for (const paint of node.fills) {
      if (paint.type === 'IMAGE') {
        const image = figma.getImageByHash(paint.imageHash)
        if (image?.hash && !imageMap[image.hash]) {
          const bytes = await image.getBytesAsync()
          imageMap[image.hash] = Buffer.from(bytes).toString('base64')
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
  if (node.masterComponent) obj.masterComponent = await nodeToObject(node.masterComponent, isFullScan)
  return obj
}

const sendSelectionchange = async () => dispatch('SELECTION_CHANGE', await getSelectedObjectsCount())
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('COPY_PRESSED', async () => {
  const source = await getSource(FULL_SCAN)
  dispatch('COPY_RESPONSE', JSON.stringify(source))
})

handleEvent('CLOSE', (data) => {
  const message = typeof data === 'string' ? data : undefined
  figma.closePlugin(message)
})
