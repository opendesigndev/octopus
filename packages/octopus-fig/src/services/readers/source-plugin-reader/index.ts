import { DesignEmitter } from './design-emitter'

import type { PluginSource } from '../../../typings/pluginSource'
// eslint-disable-next-line import/no-named-as-default
import type EventEmitter from 'eventemitter3'

/**
 * Reader that downloads given design from Figma API and provide them through `EventEmitter` calls.
 */
export class SourcePluginReader {
  private _pluginSource: PluginSource

  /**
   * Downloads given Figma design and provide them through `EventEmitter` calls.
   * @constructor
   * @param {SourcePluginReaderOptions} options
   */
  constructor(pluginSource: PluginSource) {
    this._pluginSource = pluginSource
  }

  /**
   * Returns `EventEmitter` which is needed in OctopusFigConverter.
   * @returns {EventEmitter} returns `EventEmitter` providing source data to the OctopusFigConverter
   */
  parse(): EventEmitter {
    return new DesignEmitter(this._pluginSource)
  }
}
