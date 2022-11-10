import { DesignEmitter } from './source-plugin-reader/design-emitter'

import type { PluginSource } from '../../typings/pluginSource'
// eslint-disable-next-line import/no-named-as-default
import type EventEmitter from 'eventemitter3'

export type SourcePluginReaderOptions = {
  pluginSource: PluginSource
}

/**
 * Reader that downloads given design from Figma API and provide them through `EventEmitter` calls.
 */
export class SourcePluginReader {
  private _parser: DesignEmitter

  /**
   * Downloads given Figma design and provide them through `EventEmitter` calls.
   * @constructor
   * @param {SourcePluginReaderOptions} options
   */
  constructor(options: SourcePluginReaderOptions) {
    this._parser = new DesignEmitter(options.pluginSource)
  }

  /**
   * Returns `EventEmitter` which is needed in OctopusFigConverter.
   * @returns {EventEmitter} returns `EventEmitter` providing source data to the OctopusFigConverter
   */
  parse(): EventEmitter {
    return this._parser
  }
}
