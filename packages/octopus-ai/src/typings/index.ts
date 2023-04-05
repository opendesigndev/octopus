/* eslint-disable @typescript-eslint/ban-types */

import type { AdditionalTextData, RawArtboardEntry } from './raw/index.js'
import type { Metadata } from '../services/readers/ai-file-reader-common.js'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

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

export type SourceTree = {
  metadata: Metadata
  images: SourceImage[]
  artboards: RawArtboardEntry[]
  additionalTextData: AdditionalTextData
}
