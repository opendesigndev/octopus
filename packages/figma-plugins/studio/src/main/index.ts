import { dispatch, handleEvent } from '@opendesign/figma-plugin-common/dist/message-handler'
import { getSourceData, getSelectedNodes } from '@opendesign/figma-plugin-common/dist/source-serializer'

import { version } from '../../package.json'

figma.showUI(__html__, { height: 337, width: 320 })

const sendSelectionchange = () => dispatch('SELECTION_CHANGE', getSelectedNodes().length)
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('COPY_PRESSED', async () => {
  const source = await getSourceData({ version, exportPreviews: false })
  dispatch('COPY_RESPONSE', JSON.stringify(source))
})

handleEvent('CLOSE', (data) => {
  const message = typeof data === 'string' ? data : undefined
  figma.closePlugin(message)
})
