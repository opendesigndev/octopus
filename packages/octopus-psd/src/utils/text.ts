import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { keys } from '@opendesign/octopus-common/dist/utils/common.js'

import { DEFAULTS } from './defaults.js'

import type { RawEngineDataResourceDictFontSet, RawFontProperties, RawStyleSheetData } from '../typings/raw'
import type { SourceColor } from '../typings/source.js'

export function getFontProperties(
  fontSet: RawEngineDataResourceDictFontSet[],
  styleSheetData?: RawStyleSheetData
): RawFontProperties {
  const fontIdx = styleSheetData?.Font ?? 0
  const fontPostScriptName = fontSet[fontIdx]?.Name ?? ''
  const fontStyleNameKey =
    keys(DEFAULTS.TEXT.FONT_STYLES).find((fontStyleName) => fontPostScriptName.endsWith(fontStyleName)) ?? `-Regular`
  const fontName = fontPostScriptName.replace(fontStyleNameKey, '')
  const fontStyleName = DEFAULTS.TEXT.FONT_STYLES[fontStyleNameKey] ?? DEFAULTS.TEXT.FONT_STYLE

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
