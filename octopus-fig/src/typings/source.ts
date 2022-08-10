import type { Octopus } from './octopus.js'

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
