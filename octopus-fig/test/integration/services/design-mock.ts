import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { EventEmitter } from 'eventemitter3'

import { parseJsonFromFile } from '../../../src/utils/files'

import type { Event } from './asset-updater'
import type { ResolvedFrame } from '@avocode/figma-parser/lib/src/index-node'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type ResolvedContent = {
  artboards: ResolvedFrame[]
  components: ResolvedFrame[]
  libraries: ResolvedFrame[]
}

export class DesignMock extends EventEmitter {
  private _eventDataPath: string
  private _finalizeDesign: DetachedPromiseControls<ResolvedContent>

  constructor(eventDataPath: string) {
    super()
    this._eventDataPath = eventDataPath
    this._finalizeDesign = detachPromiseControls<ResolvedContent>()

    this._emitOnReady()
  }

  private async _emitOnReady() {
    const eventData = (await parseJsonFromFile<Event[]>(this._eventDataPath)) ?? []
    for (const e of eventData) {
      if (e.event === 'ready:design') {
        e.data.content = this._finalizeDesign.promise
      }

      this.emit(e.event, e.data)
    }

    this._finalizeDesign.resolve()
  }
}
