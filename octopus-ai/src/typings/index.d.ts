/* eslint-disable @typescript-eslint/ban-types */

import type { RawArtboardEntry, RawMetadata, RawSource, RawSourceRootOcProperties } from './raw'

// Services
export interface Logger {
  fatal: Function
  error: Function
  warn: Function
  info: Function
  debug: Function
  trace: Function
  silent: Function
}

export type Coord = [number, number]
export type RgbColorComponents = [number, number, number]
//@todo sort out dual type
export type GradientStop = {
  color: RgbColorComponents
  exp?: number
  position?: number
}

export type Color = { r: number; g: number; b: number; a: number }
export type GradientColorStop = {
  position: number
  interpolation?: 'LINEAR' | 'POWER' | 'REVERSE_POWER'
  interpolationParameternumber?: number
  color: Color
}

export type SourceImage = { id: string; rawValue: Buffer; path: string }
export type SourceTree = {
  source: RawSource
  metadata: RawMetadata
  images: SourceImage[]
  artboards: RawArtboardEntry[]
  ocProperties: RawSourceRootOcProperties
}
