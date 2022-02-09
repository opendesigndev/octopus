import type { RawPath, RawOrigin, RawPathComponent, RawSubpath, RawSubpathPoint } from '../../typings/source'
import type { SourceBounds, SourceMatrix, SourceRadiiCorners } from './types'
import { getBoundsFor, getMatrixFor, getPointFor, getRadiiCornersFor } from './utils'

export type SourceSubpathPoint = ReturnType<typeof mapSubpathPoint>
function mapSubpathPoint(point: RawSubpathPoint) {
  const anchor = getPointFor(point?.anchor)
  const backward = point.backward ? getPointFor(point?.backward) : undefined
  const forward = point.forward ? getPointFor(point?.forward) : undefined
  return { ...point, anchor, backward, forward }
}

export type SourceOrigin = ReturnType<typeof mapOrigin>
function mapOrigin(origin: RawOrigin) {
  const type = origin.type ? origin.type.toString() : undefined
  const bounds: SourceBounds = { ...origin.bounds, ...getBoundsFor(origin.bounds) }
  const radii: SourceRadiiCorners = { ...origin.radii, ...getRadiiCornersFor(origin.radii) }
  const Trnf: SourceMatrix = getMatrixFor(origin.Trnf)
  return { ...origin, type, bounds, radii, Trnf }
}

export type SourceSubpath = ReturnType<typeof mapSubpath>
function mapSubpath(subpath: RawSubpath) {
  const points: SourceSubpathPoint[] = (subpath.points ?? []).map(mapSubpathPoint)
  const closedSubpath: boolean = subpath.closedSubpath ?? false
  return { ...subpath, points, closedSubpath }
}

export type SourcePathComponent = ReturnType<typeof mapPathComponent>
function mapPathComponent(component: RawPathComponent) {
  const subpathListKey: SourceSubpath[] = (component.subpathListKey ?? []).map(mapSubpath)
  const origin: SourceOrigin = mapOrigin(component?.origin ?? {})
  return { ...component, origin, subpathListKey }
}

function mapPathComponents(components: RawPathComponent[]): SourcePathComponent[] {
  return components.map(mapPathComponent)
}

export type SourcePath = ReturnType<typeof mapPath>
export function mapPath(path: RawPath | undefined) {
  const pathComponents = mapPathComponents(path?.pathComponents ?? [])
  const bounds = getBoundsFor(path?.bounds)
  return { ...path, bounds, pathComponents }
}
