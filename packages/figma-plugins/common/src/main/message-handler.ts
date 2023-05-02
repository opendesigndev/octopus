const eventListeners: { type: string; callback: (data: unknown) => void }[] = []

export const dispatch = (action: string, data?: unknown) => {
  figma.ui.postMessage({ action, data })
}

export const handleEvent = (type: string, callback: (data: unknown) => void) => {
  eventListeners.push({ type, callback })
}

figma.ui.onmessage = ({ action, data }) => {
  console.info('figma.ui.onmessage', { action, data })
  for (const eventListener of eventListeners) {
    if (action === eventListener.type) eventListener.callback(data)
  }
}
