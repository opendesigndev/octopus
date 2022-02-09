import type { RawLayerEffect } from '../../typings/source'

export type SourceLayerEffect = ReturnType<typeof convertRawLayerEffect>
export function convertRawLayerEffect(effect: RawLayerEffect | undefined) {
  return { ...effect } // TODO
}
