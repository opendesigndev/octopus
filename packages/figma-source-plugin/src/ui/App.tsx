import React, { useRef } from 'react'

import logoPng from './logo.png'
import './App.css'

function App() {
  const inputRef = useRef<HTMLInputElement>(null)

  const onCreate = () => {
    console.info('XXX onCreate')

    // const count = Number(inputRef.current?.value || 0)
    // parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
  }

  return (
    <main>
      <header>
        <img src={logoPng} />
      </header>
      <section>
        <input id='input' type='number' min='0' ref={inputRef} />
        <label htmlFor='input'>Rectangle Count</label>
      </section>
      <footer>
        <button className='brand' onClick={onCreate}>
          Create
        </button>
      </footer>
    </main>
  )
}

export default App
