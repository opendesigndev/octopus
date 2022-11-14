import { convert } from './source-convertor'

import type { PluginSource } from '../../../typings/pluginSource'
import type { Event, EventDesign } from './types'

export function convertToEvents(source: PluginSource): Event[] {
  const { document, selectedContent } = source.context ?? {}

  const designId = document?.id ?? 'unknown'

  const eventDesign: EventDesign = {
    event: 'ready:design',
    data: { designId },
  }

  const events: Event[] = [eventDesign]

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
