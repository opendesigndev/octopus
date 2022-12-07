import { DesignEmitter } from './design-emitter'

import type { PluginSource } from '../../../typings/pluginSource'
// eslint-disable-next-line import/no-named-as-default
import type EventEmitter from 'eventemitter3'

/**
 * Reader that receives Design Source from Squid Plugin and provide them through `EventEmitter` calls.
 */
export class SourcePluginReader {
  private _pluginSource: PluginSource

  /**
   * Creates SourcePluginReader that can parse given Source from Squid Plugin and provide them through `EventEmitter` calls.
   * @constructor
   * @param {PluginSource} pluginSource Source generated from Squid Plugin
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
