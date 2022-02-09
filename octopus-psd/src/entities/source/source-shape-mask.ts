import type { RawShapeMask } from '../../typings/source'

export type SourceShapeMask = ReturnType<typeof convertRawShapeMask>
export function convertRawShapeMask(mask: RawShapeMask | undefined) {
  return { ...mask } // TODO
}
