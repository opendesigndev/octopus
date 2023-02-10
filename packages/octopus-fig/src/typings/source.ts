import type { Octopus } from './octopus'

export type SourceBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type SourceVector = {
  x: number
  y: number
}

export type SourceTransform = [number, number, number, number, number, number]

export type SourceGeometry = {
  path: string
  fillRule: Octopus['FillRule']
}

export type SourceColor = {
  r: number
  g: number
  b: number
  a: number
}

export type SourceGradientPositions = [Octopus['Vec2'], Octopus['Vec2'], Octopus['Vec2']]
