// import Clipboard from 'clipboard'
import { Buffer } from 'buffer'

import { version } from '../package.json'
import { dispatch, handleEvent } from './codeMessageHandler'

figma.showUI(__html__, { height: 360, width: 300 })

// skip invisible nodes for faster performance
figma.skipInvisibleInstanceChildren = true

// console.log('THIS', this)

type ImageMap = { [key: string]: string | undefined }
let imageMap: ImageMap = {}

// CONSTANTS
const FULL_SCAN = true
const QUICK_SCAN = false

const stringify = (val) => JSON.stringify(val, null, 2)

const getSource = async (isFullScan = false) => {
  imageMap = {} // clear imageMap
  const selectedPromises = figma.currentPage.selection.map((node) => nodeToObject(node, isFullScan))
  const selectedContent = await Promise.all(selectedPromises)

  if (!selectedContent.length) return null

  const document = { id: figma.root.id, name: figma.root.name }
  const currentPage = { id: figma.currentPage.id, name: figma.currentPage.name }
  const timestamp = new Date().toISOString()
  const assets = { images: imageMap }
  const context = { document, currentPage, selectedContent, assets }

  return { type: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE', version, timestamp, context }
}

const nodeToObject = async (node, isFullScan = false) => {
  const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__))
  const blacklist = ['parent', 'children', 'removed']

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = { id: node.id, type: node.type }
  if (node.parent) obj.parent = { id: node.parent.id, type: node.type }
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
        if (!imageMap[image.hash]) {
          const bytes = await image.getBytesAsync()
          imageMap[image.hash] = Buffer.from(bytes).toString('base64')
        }
      }
    }
  }
  if (isFullScan && node.children)
    obj.children = await Promise.all(node.children.map((child) => nodeToObject(child, isFullScan)))
  if (node.masterComponent) obj.masterComponent = await nodeToObject(node.masterComponent, isFullScan)
  return obj
}

const sendSelectionchange = async () => dispatch('SELECTION_CHANGE', await getSource(QUICK_SCAN))
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('COPY_PRESSED', async () => {
  // console.info('HANDLE COPY_PRESSED') // TODO
  const source = await getSource(FULL_SCAN)
  dispatch('COPY_RESPONSE', stringify(source))
})

handleEvent('CLOSE', (data) => {
  const message = typeof data === 'string' ? data : undefined
  figma.closePlugin(message)
})
