import paper from 'paper'

paper.setup(new paper.Size(100, 100))

const SIMPLIFY_TOLERANCE = 1

/**
 * @see https://gitlab.avcd.cz/backend/backend/-/issues/2312
 */
export function simplifyPathData(pathData: string): string {
  if (typeof pathData !== 'string') return pathData

  const compound = new paper.CompoundPath(pathData)

  compound.children.forEach((child: paper.Path) => {
    if (child.segments.length > 100) child.simplify(SIMPLIFY_TOLERANCE)
  })

  return compound.pathData
}
