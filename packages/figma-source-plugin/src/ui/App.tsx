import React, { useRef, useState, useCallback, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { dispatch } from './dispatcher'
import logoPng from './logo.png'
import './App.css'
import { sleep } from './sleep'

const getSelectionText = (selectedObjects: number): JSX.Element => {
  if (selectedObjects === 0) return <p className='disabled'>no object selected</p>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clipboardRef = useRef<any>(null)

  const [selectedObjects, setSelectedObjects] = useState(0)
  const [copyCount, setCopyCount] = useState(0)
  const [copyText, setCopyText] = useState('')

  const onCopy = useCallback(async () => {
    setCopyCount(copyCount + 1)
    await sleep(20) // need to sleep a while to update the copy button
    dispatch('COPY_PRESSED')
  }, [copyCount])

  const onCopied = useCallback(async (_text: string, result: boolean) => {
    const message = result ? 'Copy was successful, paste into Squid' : 'Copy was unsuccessful'
    await sleep(1000) // need to sleep a while to make sure the clipboard is updated before closing
    dispatch('CLOSE', message)
  }, [])

  useEffect(() => {
    window.onmessage = async (event) => {
      const { action, data } = event.data.pluginMessage
      if (action === 'SELECTION_CHANGE') {
        if (typeof data === 'number') setSelectedObjects(data)
      }
      if (action === 'COPY_RESPONSE') {
        if (typeof data === 'string') {
          setCopyText(data)
          clipboardRef.current?.onClick()
        }
      }
    }
  }, [])

  const isCopyDisabled = copyCount !== 0 || selectedObjects === 0
  const buttonText = copyCount === 0 ? 'Copy to clipboard' : `Copying...`

  return (
    <main>
      <header>
        <img src={logoPng} />
      </header>
      <section>
        <div id='selectionSection'>{getSelectionText(selectedObjects)}</div>
        <div id='textSection'>
          <p>Click the button bellow to copy selected artboards. To paste open a project in Squid and press ⌘V.</p>
        </div>
        <button onClick={onCopy} disabled={isCopyDisabled}>
          {buttonText}
        </button>
        <CopyToClipboard onCopy={onCopied} text={copyText} ref={clipboardRef}>
          <p hidden={true}>HIDDEN</p>
        </CopyToClipboard>
      </section>
    </main>
  )
}

export default App
