import type { LayerGroupingService } from '../conversion/text-layer-grouping-service'

export let layerGroupingService: LayerGroupingService | null = null

export function set(instance: LayerGroupingService): void {
  layerGroupingService = instance
}
