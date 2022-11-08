import { flattenLayers } from './common-design'

import type { FigmaArtboard } from '../types/figma'

export function findArtboardUsedComponents(artboard: FigmaArtboard): string[] {
  return flattenLayers<{ id: string; type?: string; componentId?: string }>(artboard).reduce((ids: string[], layer) => {
    if (layer?.type === 'COMPONENT') {
      ids.push(layer?.id)
      return ids
    }

    if (layer?.componentId) {
      ids.push(layer?.componentId)
      return ids
    }

    return ids
  }, []) as string[]
}