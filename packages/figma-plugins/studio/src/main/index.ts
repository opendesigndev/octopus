import { dispatch, handleEvent } from '@opendesign/figma-plugin-common/dist/message-handler'
import { SourceSerializer } from '@opendesign/figma-plugin-common/dist/source-serializer'

import { version } from '../../package.json'

figma.showUI(__html__, { height: 337, width: 320 })

const sendSelectionchange = () => dispatch('SELECTION_CHANGE', SourceSerializer.getSelectedNodes().length)
figma.on('selectionchange', () => sendSelectionchange())
sendSelectionchange() // initial send

handleEvent('COPY_PRESSED', async () => {
  const source = await new SourceSerializer({ version, exportPreviews: false }).getSourceData()
  dispatch('COPY_RESPONSE', JSON.stringify(source))
})

handleEvent('CLOSE', (data: unknown) => {
  const message = typeof data === 'string' ? data : undefined
  figma.closePlugin(message)
})

handleEvent('NOTIFY', (data) => {
  if (typeof data !== 'object') return
  const { message, isError = false } = data
  if (typeof message !== 'string') return
  figma.notify(message, { error: isError })
})
