import { dispatch, handleEvent } from './message-handler'
import { getSourceData, getSelectedNodes } from './source-serializer'

figma.showUI(__html__, { height: 360, width: 300 })

const sendSelectionchange = () => dispatch('SELECTION_CHANGE', getSelectedNodes().length)
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('COPY_PRESSED', async () => {
  const source = await getSourceData()
  dispatch('COPY_RESPONSE', JSON.stringify(source))
})

handleEvent('CLOSE', (data) => {
  const message = typeof data === 'string' ? data : undefined
  figma.closePlugin(message)
})
