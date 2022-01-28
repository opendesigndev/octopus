import type { RawShapeMask } from '../../typings/source'

export type SourceShapeMask = ReturnType<typeof mapShapeMask>
export function mapShapeMask(mask: RawShapeMask | undefined) {
  return { ...mask } // TODO
}
