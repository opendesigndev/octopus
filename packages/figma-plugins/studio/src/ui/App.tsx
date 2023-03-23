import React, { useState, useCallback, useEffect } from 'react'

import './App.css'
import logoPng from './logo.png'
import { dispatch } from './utils/dispatcher'
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
    dispatch('COPY_PRESSED')
  }, [copyCount])

  useEffect(() => {
    window.onmessage = async (event) => {
      const { action, data } = event.data.pluginMessage
      console.info('window.onmessage', { action })
      if (action === 'SELECTION_CHANGE') {
        if (typeof data !== 'number') return
        setSelectedObjects(data)
      }
      if (action === 'COPY_RESPONSE') {
        if (typeof data !== 'string') return
        const copyPromise = new Promise((resolve) => {
          document.addEventListener('copy', async (event) => {
            if (!event.clipboardData) return resolve(false)
            event.preventDefault()
            event.clipboardData.setData('text/plain', `[FIGMA_PLUGIN_OBJECT]${data}`)
            await sleep(1000) // need to sleep a while to make sure the clipboard is updated before closing
            resolve(true)
          })
        })
        const textarea = document.createElement('textarea')
        textarea.setAttribute('hidden', 'true')
        textarea.value = 'Copying failed, try again in desktop app'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        const copyResult = await copyPromise
        console.timeEnd('ClipboardData')
        const isError = Boolean(!copyResult)
        const message = isError
          ? 'Copy was unsuccessful, try again in desktop app'
          : 'Copy was successful, paste into Ceros Studio'
        dispatch('NOTIFY', { message, isError })
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