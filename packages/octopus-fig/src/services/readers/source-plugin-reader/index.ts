import { DesignEmitter } from './design-emitter.js'

import type { PluginSource } from '../../../typings/plugin-source.js'
import type { AbstractReader } from '../abstract-reader.js'
import type { EventEmitter } from 'eventemitter3'

export type { PluginSource }

/**
 * Reader that receives Design Source from Squid Plugin and provide them through `EventEmitter` calls.
 */
export class SourcePluginReader implements AbstractReader {
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
  getSourceDesign(): EventEmitter {
    return new DesignEmitter(this._pluginSource)
  }

  getDesignMeta(): never {
    throw new Error('SourcePluginReader does not support getDesignMeta()')
  }
}
