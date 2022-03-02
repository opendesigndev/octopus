import type { RawResourcesColorSpace } from '../typings/raw'

export type RgbColorComponents = [number, number, number]

export function getColorSpaceName(colorSpace: Record<string, unknown> | string | null): string | null {
  if (typeof colorSpace === 'string') {
    return colorSpace
  }

  if (Array.isArray(colorSpace) && typeof colorSpace[0] === 'string') {
    return colorSpace[0]
  }
  //@todo solve warnings. console should not be present
  console.warn('getColorSpaceName', 'Unexpected ColorSpace format', { colorSpace })
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
  //@todo solve warnings. console should not be present
  console.warn('guessColorSpaceByComponents', 'Falling back to default color for', { color })
  return [0, 0, 0]
}

export function convertDeviceRGB(color: number[]): RgbColorComponents {
  if (color.length !== 3) {
    console.warn('convertDeviceRGB', `Unexpected color component count ${color.length}`, { color })
    return guessColorSpaceByComponents(color)
  }
  return normalizeRgb(color)
}

export function convertDeviceCMYK(color: number[]): RgbColorComponents {
  if (color.length !== 4) {
    console.warn('convertDeviceCMYK', `Unexpected color component count ${color.length}`, { color })
    return guessColorSpaceByComponents(color)
  }
  return cmykToRgb(color)
}

export function convertDeviceGray(color: number[]): RgbColorComponents {
  if (color.length !== 1) {
    console.warn('convertDeviceGray', `Unexpected color component count ${color.length}`, { color })
    return guessColorSpaceByComponents(color)
  }
  return grayToRgb(color)
}

export function convertICCBased(color: number[]): RgbColorComponents {
  /* ICC based color profile contain N components (Grayscae, RGB or CMYK).
   * It also contains color profile stream, that is ignored for now and the
   * color space is guessed by number of components.
   */
  return guessColorSpaceByComponents(color)
}

export function normalizeRgb(color: number[]): RgbColorComponents {
  const [r, g, b] = color.map((c) => c * 255)
  return roundComponents([r, g, b])
}

export function grayToRgb(color: number[]): RgbColorComponents {
  const c = color[0] * 255
  return roundComponents([c, c, c])
}

export function cmykToRgb(color: number[]): RgbColorComponents {
  const [c, m, y, k] = color
  const r = 255 * (1 - c) * (1 - k)
  const g = 255 * (1 - m) * (1 - k)
  const b = 255 * (1 - y) * (1 - k)
  return roundComponents([r, g, b])
}

export function roundComponents(components: RgbColorComponents): RgbColorComponents {
  const [r, g, b] = components.map(Math.round)
  return [r, g, b]
}

export function parseColor(colorCompontents: number[]): number[] {
  return colorCompontents
    .map((channel) => (Number.isFinite(channel) ? channel : 0))
    .map((channel) => Math.max(channel, 0))
    .map((channel) => Math.min(channel, 1))
}

export function convertRGBToRGBA(color: RgbColorComponents): RgbColorComponents {
  return color.map((c) => c / 255) as RgbColorComponents
}

export default function convertColor(
  color: number[],
  colorSpace: RawResourcesColorSpace['key'] | string
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
      //@todo: remove console logger
      console.warn('convertColor', 'Unknown ColorSpace', { colorSpaceName })
      return convertRGBToRGBA(guessColorSpaceByComponents(color))
  }
}
