/* eslint-disable @typescript-eslint/ban-types */
// Services
export interface Logger {
  fatal: Function
  error: Function
  warn: Function
  info: Function
  debug: Function
  trace: Function
  silent: Function
}

export interface ArrayBufferEntry {
  path: string
  content: Uint8Array
}

export interface ArrayBuffersSourceTree {
  document: ArrayBufferEntry | null
  meta: ArrayBufferEntry | null
  user: ArrayBufferEntry | null
  images: ArrayBufferEntry[]
  pages: ArrayBufferEntry[]
}
