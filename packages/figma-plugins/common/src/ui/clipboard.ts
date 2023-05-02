export function writeTextToClipboard(str: string) {
  const textArea = document.createElement('textarea')

  textArea.value = str

  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'

  document.body.appendChild(textArea)

  textArea.focus()
  textArea.select()

  return new Promise((resolve) => {
    const copyRes = document.execCommand('copy')
    textArea.remove()
    resolve(copyRes)
  })
}
