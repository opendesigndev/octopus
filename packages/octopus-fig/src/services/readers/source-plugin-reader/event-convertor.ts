import { convert } from './source-convertor'

import type { PluginSource } from '../../../typings/pluginSource'
import type { Event, EventDesign } from './types'

export function convertToEvents(source: PluginSource): Event[] {
  const { document, selectedContent, imageMap } = source.context ?? {}

  const designId = document?.id ?? 'unknown'

  const eventDesign: EventDesign = {
    event: 'ready:design',
    data: { designId },
  }

  const events: Event[] = [eventDesign]

  if (imageMap) {
    for (const ref in imageMap) {
      const data = imageMap[ref]
      if (!data) continue
      const buffer = Buffer.from(data, 'base64')
      events.push({
        event: 'ready:fill',
        data: { designId, ref, buffer },
      })
    }
  }

  for (const content of selectedContent ?? []) {
    const nodeId = content.id
    if (!nodeId) continue
    events.push({
      event: 'ready:artboard',
      data: {
        designId,
        nodeId,
        node: {
          document: convert(content),
        },
      },
    })
  }

  return events
}
