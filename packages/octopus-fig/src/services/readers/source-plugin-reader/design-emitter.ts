import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
import { EventEmitter } from 'eventemitter3'

import { convertToEvents } from './event-convertor.js'
import { imageSize } from '../../../services/index.js'

import type { ResolvedContent, Event } from './types.js'
import type { PluginSource } from '../../../typings/plugin-source.js'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
export class DesignEmitter extends EventEmitter {
  private _sourceData: PluginSource
  private _finalizeDesign: DetachedPromiseControls<ResolvedContent>

  constructor(sourceData: PluginSource) {
    super()
    this._sourceData = sourceData
    this._finalizeDesign = detachPromiseControls<ResolvedContent>()

    this._emitOnReady()
  }

  private async _preprocessFillSizes(eventData: Event[]) {
    for (const e of eventData) {
      if (e.event === 'ready:fill') {
        e.data.size = await imageSize(e.data.buffer)
      }
    }
  }

  private async _emitOnReady() {
    const eventData = convertToEvents(this._sourceData)

    await this._preprocessFillSizes(eventData)

    for (const e of eventData) {
      if (e.event === 'ready:design') {
        e.data.content = this._finalizeDesign.promise
      }
      queueMicrotask(() => this.emit(e.event, e.data))
    }

    this._finalizeDesign.resolve()
  }
}
