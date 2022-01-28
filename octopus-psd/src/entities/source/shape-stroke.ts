import type { RawShapeStrokeStyle } from '../../typings/source'

export type SourceShapeStrokeStyle = ReturnType<typeof mapShapeStroke>
export function mapShapeStroke(stroke: RawShapeStrokeStyle | undefined) {
  return { ...stroke } // TODO
}
