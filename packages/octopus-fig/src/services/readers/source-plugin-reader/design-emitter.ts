import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { EventEmitter } from 'eventemitter3'

import { convertToEvents } from './event-convertor'

import type { PluginSource } from '../../../typings/pluginSource'
import type { ResolvedContent } from './types'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

export class DesignEmitter extends EventEmitter {
  private _sourceData: PluginSource
  private _finalizeDesign: DetachedPromiseControls<ResolvedContent>

  constructor(sourceData: PluginSource) {
    super()
    this._sourceData = sourceData
    this._finalizeDesign = detachPromiseControls<ResolvedContent>()

    this._emitOnReady()
  }

  private async _emitOnReady() {
    const eventData = convertToEvents(this._sourceData)
    for (const e of eventData) {
      if (e.event === 'ready:design') {
        e.data.content = this._finalizeDesign.promise
      }
      queueMicrotask(() => this.emit(e.event, e.data))
    }

    this._finalizeDesign.resolve()
  }
}
