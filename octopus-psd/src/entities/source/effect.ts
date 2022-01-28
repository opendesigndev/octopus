import type { RawLayerEffect } from '../../typings/source'

export type SourceLayerEffect = ReturnType<typeof mapLayerEffect>
export function mapLayerEffect(effect: RawLayerEffect | undefined) {
  return { ...effect } // TODO
}
