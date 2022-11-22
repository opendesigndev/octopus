// import Clipboard from 'clipboard'
import { Buffer } from 'buffer'

import _ from 'lodash' // TODO Remove lodash

import { version } from '../package.json'
import { dispatch, handleEvent } from './codeMessageHandler'

figma.showUI(__html__, { height: 240, width: 300 })

// console.log('THIS', this)

type ImageMap = { [key: string]: string | undefined }
let imageMap: ImageMap = {}

const getSource = async () => {
  imageMap = {} // clear imageMap
  const selectedPromises = figma.currentPage.selection.map((node) => nodeToObject(node))
  const selectedContent = await Promise.all(selectedPromises)

  if (!selectedContent.length) return null

  const document = { id: figma.root.id, name: figma.root.name }
  const currentPage = { id: figma.currentPage.id, name: figma.currentPage.name }
  const timestamp = new Date().toISOString()
  const context = { document, currentPage, selectedContent, imageMap }

  return { type: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE', version, timestamp, context }
}

const nodeToObject = async (node) => {
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
  if (node.fills?.length > 0) {
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
  if (node.children) obj.children = await Promise.all(node.children.map((child) => nodeToObject(child)))
  if (node.masterComponent) obj.masterComponent = await nodeToObject(node.masterComponent)
  return obj
}

const sendSelectionchange = async () => dispatch('selectionchange', await getSource())
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('copy', (data) => {
  // const nodes: SceneNode[] = [];
  // for (let i = 0; i < msg.count; i++) {
  //   const rect = figma.createRectangle();
  //   rect.x = i * 150;
  //   rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
  //   figma.currentPage.appendChild(rect);
  //   nodes.push(rect);
  // }
  // figma.currentPage.selection = nodes;
  // figma.viewport.scrollAndZoomIntoView(nodes);

  console.info('DATA:', data)

  console.info('LODASH:', _.toUpper('Hello There'))

  // const clipBoard = new Clipboard('HELLO')
  // console.info('HERE HERE HERE', clipBoard)
  // clipBoard.on('success', (e: unknown) => {
  //   console.info('Clipboard Success', e)
  //   //   this.onCopied(e)
  // })
})

// handleEvent('close', () => {
//   figma.closePlugin()
// })
