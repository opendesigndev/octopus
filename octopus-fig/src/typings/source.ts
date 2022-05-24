import type { Octopus } from './octopus'

export type SourceBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type SourceTransform = [number, number, number, number, number, number]

export type SourceGeometry = {
  path: string
  fillRule: Octopus['FillRule']
}
