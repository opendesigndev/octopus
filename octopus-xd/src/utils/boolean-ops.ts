import { RawShapeCompound } from '../typings/source'

export function convertBooleanOp(shape: RawShapeCompound) {
  const ops = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    intersect: 'INTERSECT',
    exclude: 'EXCLUDE'
  } as const
  const rawOp = shape.operation as keyof typeof ops
  return (ops[ rawOp ]) || 'UNION'
}