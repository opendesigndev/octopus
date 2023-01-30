import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { DEFAULTS } from './defaults.js'

import type { EngineDataResourceDictFontSet, FontProperties, StyleSheetData } from '../typings/raw'
import type { SourceColor } from '../typings/source.js'

export function getFontProperties(
  fontSet: EngineDataResourceDictFontSet[],
  styleSheetData?: StyleSheetData
): FontProperties {
  const fontIdx = styleSheetData?.Font ?? 0
  const fontPostScriptName = fontSet[fontIdx]?.Name ?? ''
  const fontStyleNameKey =
    Object.keys(DEFAULTS.TEXT.FONT_STYLES).find((fontStyleName) => fontPostScriptName.endsWith(fontStyleName)) ??
    DEFAULTS.TEXT.FONT_STYLE

  const fontName = fontPostScriptName.replace(fontStyleNameKey, '')
  const fontStyleName =
    DEFAULTS.TEXT.FONT_STYLES[fontStyleNameKey as keyof typeof DEFAULTS.TEXT.FONT_STYLES] ?? DEFAULTS.TEXT.FONT_STYLE

  return {
    fontPostScriptName,
    fontName,
    fontStyleName,
  }
}

export function getTextColor(sourceColor: number[] | undefined): SourceColor {
  const colorArr = asArray(sourceColor)

  const color = {
    r: (colorArr[1] ?? 0) * DEFAULTS.RGB_COLOR_MAX_VALUE,
    g: (colorArr[2] ?? 0) * DEFAULTS.RGB_COLOR_MAX_VALUE,
    b: (colorArr[3] ?? 0) * DEFAULTS.RGB_COLOR_MAX_VALUE,
  }

  return color
}
