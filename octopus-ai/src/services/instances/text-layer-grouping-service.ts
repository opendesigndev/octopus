import { TextLayerGroupingService } from '../conversion/text-layer-grouping-service'

import type { AdditionalTextData } from '../../typings/raw'

export let textLayerGroupingService: TextLayerGroupingService | null = null

export function set(additionalTextData: AdditionalTextData): void {
  const instance = new TextLayerGroupingService(additionalTextData)
  textLayerGroupingService = instance
}
