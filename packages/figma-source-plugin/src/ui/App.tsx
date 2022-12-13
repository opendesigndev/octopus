import React, { useRef, useState, useCallback, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

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
        if (typeof data !== 'number') return
        setSelectedObjects(data)
      }
      if (action === 'COPY_RESPONSE') {
        if (typeof data !== 'string') return
        setCopyText(data)
        clipboardRef.current?.onClick()
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
          <p>Click the button bellow to copy selected artboards. To paste open a project in Squid and press ⌘V.</p>
        </div>
        <button onClick={onCopy} disabled={isCopyDisabled} className={buttonClass}>
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
