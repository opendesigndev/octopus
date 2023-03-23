import type { TextLayerGroupingservice } from '../conversion/text-layer-grouping-service/index.js'

export let textLayerGroupingService: TextLayerGroupingservice | null = null

export function set(instance: TextLayerGroupingservice): void {
  textLayerGroupingService = instance
}
