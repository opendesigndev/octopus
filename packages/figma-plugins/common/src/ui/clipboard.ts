export async function writeTextToClipboard(str: string): Promise<boolean> {
  const copyPromise: Promise<boolean> = new Promise((resolve) => {
    document.addEventListener(
      'copy',
      async (event) => {
        try {
          if (!event.clipboardData) return resolve(false)
          event.preventDefault()
          event.clipboardData.setData('text/plain', str)
          resolve(true)
        } catch (e) {
          console.warn('CopyEventListener Error:', e)
          resolve(false)
        }
      },
      { once: true }
    )
  })

  try {
    const textArea = document.createElement('textarea')
    textArea.value = 'Copying failed. Please try again in the desktop app.'
    textArea.style.position = 'fixed'
    textArea.style.left = '-99px'
    textArea.style.top = '-99px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const execRes = document.execCommand('copy')
    if (!execRes) return false
    const copyRes = await copyPromise
    textArea.remove()
    return copyRes
  } catch (error) {
    console.warn('WriteTextToClipboard Error:', error)
    return false
  }
}
