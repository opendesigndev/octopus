// Services 
export interface Logger {
  fatal: Function,
  error: Function,
  warn: Function,
  info: Function,
  debug: Function,
  trace: Function,
  silent: Function
}

export interface ArrayBufferEntry {
  path: string,
  content: Uint8Array
}

export interface ArrayBuffersSourceTree {
  manifest: ArrayBufferEntry | null,
  resources: ArrayBufferEntry | null,
  interactions: ArrayBufferEntry | null,
  artboards: ArrayBufferEntry[]
}
