import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { clamp } from '@avocode/octopus-common/dist/utils/math'

import { logger } from '../services/instances/logger'

import type { RawResourcesColorSpace } from '../typings/raw'

export type RgbColorComponents = [number, number, number]

export function getColorSpaceName(colorSpace: Record<string, unknown> | string | null | string[]): string | null {
  if (typeof colorSpace === 'string') {
    return colorSpace
  }

  if (Array.isArray(colorSpace) && typeof colorSpace[0] === 'string') {
    return colorSpace[0]
  }

  logger.warn('getColorSpaceName', 'Unexpected ColorSpace format', { colorSpace })
  return null
}

export function guessColorSpaceByComponents(color: number[]): RgbColorComponents {
  if (Array.isArray(color)) {
    switch (color.length) {
      case 1:
        return grayToRgb(color)
      case 3:
        return normalizeRgb(color)
      case 4:
        return cmykToRgb(color)
    }
  }
  logger.warn('guessColorSpaceByComponents', 'Falling back to default color for', { color })
  return [0, 0, 0]
}

export function convertDeviceRGB(color: number[]): RgbColorComponents {
  if (color.length !== 3) {
    logger.warn('convertDeviceRGB', `Unexpected color component count ${color.length}`, { color })
    return guessColorSpaceByComponents(color)
  }
  return normalizeRgb(color)
}

function convertDeviceCMYK(color: number[]): RgbColorComponents {
  if (color.length !== 4) {
    logger.warn('convertDeviceCMYK', `Unexpected color component count ${color.length}`, { color })
    return guessColorSpaceByComponents(color)
  }
  return cmykToRgb(color)
}

function convertDeviceGray(color: number[]): RgbColorComponents {
  if (color.length !== 1) {
    logger.warn('convertDeviceGray', `Unexpected color component count ${color.length}`, { color })
    return guessColorSpaceByComponents(color)
  }
  return grayToRgb(color)
}

function convertICCBased(color: number[]): RgbColorComponents {
  /* ICC based color profile contain N components (Grayscae, RGB or CMYK).
   * It also contains color profile stream, that is ignored for now and the
   * color space is guessed by number of components.
   */
  return guessColorSpaceByComponents(color)
}

function normalizeRgb(color: number[]): RgbColorComponents {
  const [r, g, b] = color.map((c) => c * 255)
  return roundComponents([r, g, b])
}

function grayToRgb(color: number[]): RgbColorComponents {
  const c = color[0] * 255
  return roundComponents([c, c, c])
}

function cmykToRgb(color: number[]): RgbColorComponents {
  const [c, m, y, k] = color
  const r = 255 * (1 - c) * (1 - k)
  const g = 255 * (1 - m) * (1 - k)
  const b = 255 * (1 - y) * (1 - k)
  return roundComponents([r, g, b])
}

function roundComponents(components: RgbColorComponents): RgbColorComponents {
  return components.map((component) => Math.round(component)) as RgbColorComponents
}

export function parseColor(colorCompontents: number[]): number[] {
  return colorCompontents.map((channel) => clamp(asFiniteNumber(channel, 0), 0, 1))
}

function convertRGBToRGBA(color: RgbColorComponents): RgbColorComponents {
  return color.map((c) => c / 255) as RgbColorComponents
}

export function convertColor(
  color: number[],
  colorSpace: RawResourcesColorSpace['key'] | string | string[]
): RgbColorComponents {
  const colorSpaceName = getColorSpaceName(colorSpace || null)
  switch (colorSpace) {
    case 'DeviceRGB':
      return convertRGBToRGBA(convertDeviceRGB(color))
    case 'DeviceCMYK':
      return convertRGBToRGBA(convertDeviceCMYK(color))
    case 'DeviceGray':
      return convertRGBToRGBA(convertDeviceGray(color))
    case 'ICCBased':
      return convertRGBToRGBA(convertICCBased(color))
    default:
      logger.warn('convertColor', 'Unknown ColorSpace', { colorSpaceName })
      return convertRGBToRGBA(guessColorSpaceByComponents(color))
  }
}
