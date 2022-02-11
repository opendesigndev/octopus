import type { RawPath, RawOrigin, RawPathComponent, RawSubpath, RawSubpathPoint } from '../../typings/raw'
import type { SourceBounds, SourceMatrix, SourceRadiiCorners } from '../../typings/source'
import { getBoundsFor, getMatrixFor, getPointFor, getRadiiCornersFor } from '../../utils/source'

export type SourceSubpathPoint = ReturnType<typeof convertRawSubpathPoint>
function convertRawSubpathPoint(point: RawSubpathPoint) {
  const anchor = getPointFor(point?.anchor)
  const backward = point.backward ? getPointFor(point?.backward) : undefined
  const forward = point.forward ? getPointFor(point?.forward) : undefined
  return { ...point, anchor, backward, forward }
}

export type SourceOrigin = ReturnType<typeof convertRawOrigin>
function convertRawOrigin(origin: RawOrigin) {
  const type = origin.type ? origin.type.toString() : undefined
  const bounds: SourceBounds = { ...origin.bounds, ...getBoundsFor(origin.bounds) }
  const radii: SourceRadiiCorners = { ...origin.radii, ...getRadiiCornersFor(origin.radii) }
  const Trnf: SourceMatrix = getMatrixFor(origin.Trnf)
  return { ...origin, type, bounds, radii, Trnf }
}

export type SourceSubpath = ReturnType<typeof convertRawSubpath>
function convertRawSubpath(subpath: RawSubpath) {
  const points: SourceSubpathPoint[] = (subpath.points ?? []).map(convertRawSubpathPoint)
  const closedSubpath: boolean = subpath.closedSubpath ?? false
  return { ...subpath, points, closedSubpath }
}

export type SourcePathComponent = ReturnType<typeof convertRawPathComponent>
function convertRawPathComponent(component: RawPathComponent) {
  const subpathListKey: SourceSubpath[] = (component.subpathListKey ?? []).map(convertRawSubpath)
  const origin: SourceOrigin = convertRawOrigin(component?.origin ?? {})
  return { ...component, origin, subpathListKey }
}

function convertRawPathComponents(components: RawPathComponent[]): SourcePathComponent[] {
  return components.map(convertRawPathComponent)
}

export type SourcePath = ReturnType<typeof convertRawPath>
export function convertRawPath(path: RawPath | undefined) {
  const pathComponents = convertRawPathComponents(path?.pathComponents ?? [])
  const bounds = getBoundsFor(path?.bounds)
  return { ...path, bounds, pathComponents }
}
