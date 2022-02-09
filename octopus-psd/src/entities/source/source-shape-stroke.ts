import type { RawShapeStrokeStyle } from '../../typings/source'

export type SourceShapeStrokeStyle = ReturnType<typeof convertRawShapeStroke>
export function convertRawShapeStroke(stroke: RawShapeStrokeStyle | undefined) {
  return { ...stroke } // TODO
}
