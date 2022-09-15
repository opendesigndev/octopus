/* eslint-disable @typescript-eslint/ban-types */

import type { Metadata, RawArtboardSource } from '../services/conversion/ai-file-reader'
import type { AdditionalTextData } from './raw'

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

export type GradientStop = {
  color: RgbColorComponents
  interpolation?: 'LINEAR' | 'POWER' | 'REVERSE_POWER'
  interpolationParameter?: number
  position?: number
}

export type Color = { r: number; g: number; b: number; a: number }

export type SourceImage = { id: string; getImageData: () => Promise<Buffer>; path: string }

export type SourceTree = {
  metadata: Metadata
  images: SourceImage[]
  artboards: RawArtboardSource[]
  additionalTextData: AdditionalTextData
}
