import React, { useRef, useState, useCallback, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { dispatch } from './dispatcher'
import logoPng from './logo.png'
import './App.css'
import { sleep } from './sleep'

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
        <label htmlFor='input'>Rectangle Count: {selectedObjects}</label>
      </section>
      <footer>
        <button className='brand' onClick={onCopy} disabled={isCopyDisabled}>
          {buttonText}
        </button>
        <CopyToClipboard onCopy={onCopied} text={copyText} ref={clipboardRef}>
          <p hidden={true}>HIDDEN</p>
        </CopyToClipboard>
      </footer>
    </main>
  )
}

export default App
