// eslint-disable-next-line import/no-named-as-default
import type EventEmitter from 'eventemitter3'

export abstract class AbstractReader {
  parse(_ids?: string[]): EventEmitter {
    throw new Error('Subclass of "Reader" has no "parse" method implemented!')
  }
}
