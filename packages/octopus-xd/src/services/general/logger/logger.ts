/* eslint-disable @typescript-eslint/ban-types */
export interface Logger {
  fatal: Function
  error: Function
  warn: Function
  info: Function
  debug: Function
  trace: Function
  silent: Function
}
