import type { EventEmitter } from 'eventemitter3'

export abstract class AbstractReader {
  getSourceDesign(_: { ids?: string[] }): EventEmitter {
    throw new Error('Subclass of "Reader" has no "getSourcDesign" method implemented!')
  }
}
