import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { EventEmitter } from 'eventemitter3'

import { convertToEvents } from './source-event-convertor'

import type { PluginSource } from '../../../typings/pluginSource'
import type { ResolvedContent } from './types'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

export class DesignEmitter extends EventEmitter {
  private _eventSourceData: PluginSource
  private _finalizeDesign: DetachedPromiseControls<ResolvedContent>

  constructor(eventSourceData: PluginSource) {
    super()
    this._eventSourceData = eventSourceData
    this._finalizeDesign = detachPromiseControls<ResolvedContent>()

    this._emitOnReady()
  }

  private async _emitOnReady() {
    const eventData = convertToEvents(this._eventSourceData)
    for (const e of eventData) {
      if (e.event === 'ready:design') {
        e.data.content = this._finalizeDesign.promise
      }

      this.emit(e.event, e.data)
    }

    this._finalizeDesign.resolve()
  }
}
