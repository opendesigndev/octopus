import type { RawShapeStrokeStyle } from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'

export type SourceShapeStrokeStyle = ReturnType<typeof convertRawShapeStroke>
export function convertRawShapeStroke(stroke: RawShapeStrokeStyle | undefined) {
  const fill = new SourceEffectFill(stroke?.strokeStyleContent)
  return { ...stroke, fill }
}
