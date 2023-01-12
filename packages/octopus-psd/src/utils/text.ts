import { DEFAULTS } from './defaults.js'

import type { EngineDataResourceDictFontSet, FontProperties, StyleSheetData } from '../typings/raw'

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
