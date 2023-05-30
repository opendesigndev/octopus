import { writeTextToClipboard } from '@opendesign/figma-plugin-common/dist/ui/clipboard'
import React, { useState, useCallback, useEffect } from 'react'

import './App.css'
import logoPng from './logo.png'
import { dispatchToFigma } from './utils/dispatcher'
import { sleep } from './utils/sleep'

const MESSAGE_SUCCESS = 'Copy was successful, paste into Ceros Studio.'
const MESSAGE_FAILURE = 'Copying failed❗ Please try again in the desktop app.'

const getSelectionText = (selectedObjects: number): JSX.Element => {
  if (selectedObjects === 0) return <p className='disabled'>no objects selected</p>
  if (selectedObjects === 1)
    return (
      <p>
        <strong>1 object</strong> selected
      </p>
    )
  return (
    <p>
      <strong>{selectedObjects} objects</strong> selected
    </p>
  )
}

function App() {
  const [selectedObjects, setSelectedObjects] = useState(0)
  const [copyCount, setCopyCount] = useState(0)
  const [figmaPluginString, setFigmaPluginString] = useState<string>()

  const onCopyPressed = useCallback(async () => {
    setCopyCount(copyCount + 1)
    await sleep(20) // need to sleep a while to update the copy button
    console.time('OnCopyPressed')
    if (figmaPluginString) {
      copyToClipboardAction(figmaPluginString)
    } else {
      dispatchToFigma('COPY_PRESSED')
    }
  }, [copyCount, figmaPluginString])

  const copyToClipboardAction = useCallback(async (figmaPluginString: string) => {
    console.time('CopyToClipboardAction')
    try {
      const copyResult = await writeTextToClipboard(figmaPluginString)
      const isError = !copyResult
      await sleep(100) // need to sleep a while to make sure the clipboard is updated
      const message = isError ? MESSAGE_FAILURE : MESSAGE_SUCCESS
      dispatchToFigma('NOTIFY', { message })
    } catch (error) {
      console.warn('TextToClipboard Error:', error)
      dispatchToFigma('NOTIFY', { message: MESSAGE_FAILURE })
    }
    console.timeEnd('CopyToClipboardAction')
    console.timeEnd('OnCopyPressed')
    setCopyCount(0)
  }, [])

  useEffect(() => {
    window.onmessage = async (event) => {
      const { action, data } = event.data.pluginMessage
      console.info('window.onmessage', { action, data })
      if (action === 'SELECTION_CHANGE') {
        if (typeof data !== 'number') return
        setSelectedObjects(data)
        setFigmaPluginString(undefined)
      }
      if (action === 'COPY_RESPONSE') {
        if (typeof data !== 'object') {
          console.warn('Wrong COPY_RESPONSE:', data)
          setCopyCount(0)
          return
        }
        try {
          const figmaPluginString = `[FIGMA_PLUGIN_OBJECT]${JSON.stringify(data)}`
          setFigmaPluginString(figmaPluginString)
          copyToClipboardAction(figmaPluginString)
        } catch (error) {
          console.warn('TextToClipboard Error:', error)
          dispatchToFigma('NOTIFY', { message: MESSAGE_FAILURE })
          setCopyCount(0)
        }
      }
    }
  }, [])

  const isCopyPressed = copyCount !== 0
  const isCopyDisabled = isCopyPressed || selectedObjects === 0
  const buttonText = isCopyPressed ? `Copying...` : 'Copy to clipboard'
  const buttonClass = isCopyPressed ? 'copyPressed' : undefined

  return (
    <main>
      <header>
        <img src={logoPng} />
      </header>
      <section>
        <div id='selectionSection'>{getSelectionText(selectedObjects)}</div>
        <div id='textSection'>
          <p>Select the frame you wish to copy to Ceros Studio.</p>
        </div>
        <button onClick={onCopyPressed} disabled={isCopyDisabled} className={buttonClass}>
          {buttonText}
        </button>
      </section>
    </main>
  )
}

export default App
