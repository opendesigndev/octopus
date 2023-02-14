export function sleep(ms: number) {
  return new Promise((resolve: (value?: unknown) => void) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
