export function dispatch(action: string, data?: unknown) {
  parent.postMessage({ pluginMessage: { action, data } }, '*')
}
