const eventListeners: { type: string; callback: (data: unknown) => void }[] = []

export const dispatch = (action: string, data?: unknown) => {
  figma.ui.postMessage({ action, data })
}

export const handleEvent = (type: string, callback: (data: unknown) => void) => {
  eventListeners.push({ type, callback })
}

figma.ui.onmessage = (message) => {
  for (const eventListener of eventListeners) {
    if (message.action === eventListener.type) eventListener.callback(message.data)
  }
}
