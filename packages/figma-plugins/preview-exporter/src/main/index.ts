import { dispatch, handleEvent } from '@opendesign/figma-plugin-common/dist/main/message-handler'
import { SourceSerializer } from '@opendesign/figma-plugin-common/dist/main/source-serializer'

import { version } from '../../package.json'

figma.showUI(__html__, { height: 360, width: 300 })

const sendSelectionchange = () => dispatch('SELECTION_CHANGE', SourceSerializer.getSelectedNodes().length)
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('COPY_PRESSED', async () => {
  const source = await new SourceSerializer({ version, exportPreviews: true }).getSourceData()
  dispatch('COPY_RESPONSE', source)
})

handleEvent('CLOSE', (data: unknown) => {
  const message = typeof data === 'string' ? data : undefined
  figma.closePlugin(message)
})
