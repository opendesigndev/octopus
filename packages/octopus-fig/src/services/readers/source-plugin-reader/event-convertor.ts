import { v4 as uuidv4 } from 'uuid'

import { logger, base64ToUint8Array } from '../../index.js'
import { SourceNormalizer } from './source-normalizer.js'
import { isBase64 } from './utils.js'

import type { PluginSource } from '../../../typings/plugin-source.js'
import type { Event, EventDesign } from './types.js'

export function convertToEvents(source: PluginSource): Event[] {
  const { document, selectedContent, assets } = source.context ?? {}

  if (!document?.id) logger?.warn('Unknown document id', { source })
  const designId = document?.id ?? uuidv4()
  const designEvent: EventDesign = { event: 'ready:design', data: { designId } }
  const events: Event[] = [designEvent]

  if (assets?.images) {
    for (const ref in assets.images) {
      const data = assets.images[ref]
      if (!data || !isBase64(data)) {
        logger?.error('Invalid image asset', { ref, data })
        continue
      }
      const buffer = base64ToUint8Array(data)
      events.push({ event: 'ready:fill', data: { designId, ref, buffer } })
    }
  }

  for (const content of selectedContent ?? []) {
    const nodeId = content.id
    if (!nodeId) continue
    const document = new SourceNormalizer(content).normalize()
    const data = { designId, nodeId, node: { document } }
    events.push({ event: 'ready:artboard', data })
  }

  return events
}
