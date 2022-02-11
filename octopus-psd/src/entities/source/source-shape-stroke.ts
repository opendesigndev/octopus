import type { RawShapeStrokeStyle } from '../../typings/raw'
import { convertRawShapeFill } from './source-effect-fill'

export type SourceShapeStrokeStyle = ReturnType<typeof convertRawShapeStroke>
export function convertRawShapeStroke(stroke: RawShapeStrokeStyle | undefined) {
  const fill = convertRawShapeFill(stroke?.strokeStyleContent)
  return { ...stroke, fill }
}
