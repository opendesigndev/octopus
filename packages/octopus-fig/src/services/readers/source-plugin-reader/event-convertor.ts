import { SourceNormalizer } from './source-normalizer'

import type { PluginSource } from '../../../typings/pluginSource'
import type { Event, EventDesign } from './types'

export function convertToEvents(source: PluginSource): Event[] {
  const { document, selectedContent, assets } = source.context ?? {}

  const designId = document?.id ?? 'unknown'
  const designEvent: EventDesign = { event: 'ready:design', data: { designId } }
  const events: Event[] = [designEvent]

  if (assets?.images) {
    for (const ref in assets.images) {
      const data = assets.images[ref]
      if (!data) continue
      const buffer = Buffer.from(data, 'base64')
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
