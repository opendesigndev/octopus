import kebabCase from 'lodash/kebabCase'
import React, { useState, useCallback, useEffect } from 'react'

import './App.css'
import logoPng from './logo.png'
import { dispatch } from './utils/dispatcher'
import { sleep } from './utils/sleep'
import { version } from '../../package.json'

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportData = (data: any) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`
    const name = data?.context?.document?.name ?? 'unknown'
    const fileKey = data?.context?.document?.fileKey ?? 'unknown'
    const link = document.createElement('a')
    link.href = jsonString
    link.download = `${kebabCase(name)}-${fileKey}.figma-plugin.json`
    link.click()
  }

  useEffect(() => {
    window.onmessage = async (event) => {
      const { action, data } = event.data.pluginMessage
      console.info('window.onmessage', { action })
      if (action === 'SELECTION_CHANGE') {
        if (typeof data !== 'number') return
        setSelectedObjects(data)
      }
      if (action === 'COPY_RESPONSE') {
        if (!data) return
        exportData(data)
        await sleep(1000)
        dispatch('CLOSE')
      }
    }
  }, [])

  const isCopyPressed = copyCount !== 0
  const isCopyDisabled = isCopyPressed || selectedObjects === 0
  const buttonText = copyCount === 0 ? 'Download' : `Downloading...`
  const buttonClass = isCopyPressed ? 'copyPressed' : undefined

  return (
    <main>
      <header>
        <img src={logoPng} />
      </header>
      <section>
        <div id='selectionSection'>{getSelectionText(selectedObjects)}</div>
        <div id='textSection'>
          <p>
            Click the button bellow to download
            <br />
            selected artboards.
          </p>
        </div>
        <button onClick={onCopy} disabled={isCopyDisabled} className={buttonClass}>
          {buttonText}
        </button>
      </section>
      <footer>
        <p>v{version}</p>
      </footer>
    </main>
  )
}

export default App
