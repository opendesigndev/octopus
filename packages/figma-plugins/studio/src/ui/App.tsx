import { writeTextToClipboard } from '@opendesign/figma-plugin-common/dist/ui/clipboard'
import React, { useState, useCallback, useEffect } from 'react'

import './App.css'
import logoPng from './logo.png'
import { dispatchToFigma } from './utils/dispatcher'
import { sleep } from './utils/sleep'

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

  const onCopy = useCallback(async () => {
    setCopyCount(copyCount + 1)
    await sleep(20) // need to sleep a while to update the copy button
    console.time('ClipboardData')
    dispatchToFigma('COPY_PRESSED')
  }, [copyCount])

  useEffect(() => {
    window.onmessage = async (event) => {
      const { action, data } = event.data.pluginMessage
      console.info('window.onmessage', { action, data })
      if (action === 'SELECTION_CHANGE') {
        if (typeof data !== 'number') return
        setSelectedObjects(data)
      }
      if (action === 'COPY_RESPONSE') {
        if (typeof data !== 'object') return
        try {
          const stringified = JSON.stringify(data)
          const copyResult = await writeTextToClipboard(`[FIGMA_PLUGIN_OBJECT]${stringified}`)
          await sleep(500) // need to sleep a while to make sure the clipboard is updated before closing
          const isError = !copyResult
          const message = isError
            ? 'Copy was unsuccessful, try again in desktop app'
            : 'Copy was successful, paste into Ceros Studio'
          dispatchToFigma('NOTIFY', { message, isError })
        } catch (error) {
          console.warn('TextToClipboard Error:', error)
          dispatchToFigma('NOTIFY', { message: 'Copy was unsuccessful, try again in desktop app', isError: true })
        }
        console.timeEnd('ClipboardData')
        setCopyCount(0)
      }
    }
  }, [])

  const isCopyPressed = copyCount !== 0
  const isCopyDisabled = isCopyPressed || selectedObjects === 0
  const buttonText = copyCount === 0 ? 'Copy to clipboard' : `Copying...`
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
        <button onClick={onCopy} disabled={isCopyDisabled} className={buttonClass}>
          {buttonText}
        </button>
      </section>
    </main>
  )
}

export default App
