import type { RawPath, RawOrigin, RawPathComponent, RawSubpath, RawSubpathPoint } from '../../typings/source'
import type { SourceBounds, SourceMatrix } from './types'
import { getBoundsFor, getMatrixFor, getPointFor } from './utils'

export type SourcePointXY = { x: number; y: number }

export type SourceSubpathPoint = ReturnType<typeof mapSubpathPoint>
export function mapSubpathPoint(point: RawSubpathPoint) {
  const anchor = getPointFor(point?.anchor)
  const backward = point.backward ? getPointFor(point?.backward) : undefined
  const forward = point.forward ? getPointFor(point?.forward) : undefined
  return { ...point, anchor, backward, forward }
}

export type SourceOrigin = ReturnType<typeof mapOrigin>
export function mapOrigin(origin: RawOrigin | undefined) {
  const Trnf: SourceMatrix = getMatrixFor(origin?.Trnf)
  const bounds: SourceBounds = { ...origin?.bounds, ...getBoundsFor(origin?.bounds) }
  const type = origin?.type ? origin.type.toString() : undefined
  return { ...origin, Trnf, bounds, type }
}

export type SourceSubpath = ReturnType<typeof mapSubpath>
export function mapSubpath(subpath: RawSubpath) {
  const points: SourceSubpathPoint[] = (subpath.points ?? []).map(mapSubpathPoint)
  const closedSubpath: boolean = subpath.closedSubpath ?? false
  return { ...subpath, points, closedSubpath }
}

export type SourcePathComponent = ReturnType<typeof mapPathComponent>
export function mapPathComponent(component: RawPathComponent) {
  const subpathListKey: SourceSubpath[] = (component.subpathListKey ?? []).map(mapSubpath)
  const origin: SourceOrigin = mapOrigin(component?.origin)
  return { ...component, origin, subpathListKey }
}

export function mapPathComponents(components: RawPathComponent[]): SourcePathComponent[] {
  return components.map(mapPathComponent)
}

export type SourcePath = ReturnType<typeof mapPath>
export function mapPath(path: RawPath | undefined) {
  const pathComponents = mapPathComponents(path?.pathComponents ?? [])
  const bounds = getBoundsFor(path?.bounds)
  return { ...path, bounds, pathComponents }
}
