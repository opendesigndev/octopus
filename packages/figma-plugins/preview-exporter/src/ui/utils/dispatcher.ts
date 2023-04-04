export function dispatchToFigma(action: string, data?: unknown) {
  parent.postMessage({ pluginMessage: { action, data } }, '*')
}
