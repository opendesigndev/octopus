import { normalizeText } from '@opendesign/octopus-common/dist/postprocessors/text'
import { asArray, asNumber, asString } from '@opendesign/octopus-common/dist/utils/as'
import { getPresentProps, push } from '@opendesign/octopus-common/dist/utils/common'

import { DEFAULTS } from '../../utils/defaults'
import { convertObjectMatrixToArray } from '../../utils/matrix'
import { createMatrix } from '../../utils/paper'
import { OctopusEffectsText } from './octopus-effects-text'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { RawRangedStyle, RawTextLayer, RawTextParagraphRange } from '../../typings/source'
import type { SourceLayerText } from '../source/source-layer-text'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

type NormalizedRawRangedStyle = RawRangedStyle & {
  lengthFrom: number
  lengthTo: number
}

type MergedTextStyle = RawTextParagraphRange & {
  from: number
  to: number
  metaUxStyle: NormalizedRawRangedStyle | null
}

export class OctopusLayerText extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  private _removeWhitespaces(str: string): string {
    return str.replace(/\s+/g, '')
  }

  private _getLetterCase(rawLetterCase: NormalizedRawRangedStyle['textTransform']): Octopus['TextStyle']['letterCase'] {
    switch (rawLetterCase) {
      case 'lowercase': {
        return 'LOWERCASE'
      }
      case 'uppercase': {
        return 'UPPERCASE'
      }
      case 'titlecase': {
        return 'TITLE_CASE'
      }
    }
    return 'NONE'
  }

  private _constructSyntheticPSN(familyRaw: string, styleRaw: string): string {
    const family = this._removeWhitespaces(familyRaw)
    const style = this._removeWhitespaces(styleRaw)

    return style.length > 0 ? `${family}-${style}` : family
  }

  private _getUniqueSortedStops(paragraphs: RawTextParagraphRange[], meta: NormalizedRawRangedStyle[]) {
    const paragraphsStops = paragraphs.reduce((stops, paragraph) => {
      return push(stops, asNumber(paragraph?.from, 0), asNumber(paragraph?.to, 0))
    }, [])

    const metaStops = meta.reduce((stops, meta) => {
      return push(stops, asNumber(meta?.lengthFrom, 0), asNumber(meta?.lengthTo, 0))
    }, [])

    return [...new Set([...paragraphsStops, ...metaStops])].sort((a, b) => a - b)
  }

  private _getNormalizedRangedStyles(textLength: number): NormalizedRawRangedStyle[] {
    const styles = asArray(this._sourceLayer.raw?.meta?.ux?.rangedStyles)
    let i = 0
    return styles.map((style, styleIndex) => {
      const length = asNumber(style?.length, 0)
      const from = i
      const to = i + length
      i = to
      const lastElement = styleIndex === styles.length - 1
      return { ...style, lengthFrom: from, lengthTo: lastElement ? textLength : to }
    })
  }

  private _mergeMetaToParagraphs(
    paragraphs: RawTextParagraphRange[],
    meta: NormalizedRawRangedStyle[]
  ): MergedTextStyle[] {
    return this._getUniqueSortedStops(paragraphs, meta).reduce((ranges, stop, index, stops) => {
      if (index === stops.length - 1) return ranges
      const from = stop
      const to = stops[index + 1]
      const matchingParagraph = paragraphs.find((paragraph) => {
        return asNumber(paragraph?.from) <= from && to <= asNumber(paragraph?.to)
      })
      const matchingMeta = meta.find((current) => {
        return asNumber(current?.lengthFrom) <= from && to <= asNumber(current?.lengthTo)
      })
      if (!matchingParagraph && !matchingMeta) return ranges
      const merged = {
        ...matchingParagraph,
        from,
        to,
        metaUxStyle: matchingMeta || null,
      }
      return push(ranges, merged)
    }, [])
  }

  private _parseLayerWideRange(layer: RawTextLayer) {
    const decorations = asArray(layer?.style?.textAttributes?.decoration)
    const fontLetterSpacing = asNumber(layer?.style?.textAttributes?.letterSpacing, 0)
    const fontSize = asNumber(layer?.style?.font?.size, DEFAULTS.TEXT.LAYER_FONT_SIZE)
    const letterSpacing = (fontLetterSpacing * fontSize) / 1000
    const psNameRaw = asString(layer?.style?.font?.postscriptName, '')
    const family = asString(layer?.style?.font?.family, '')
    const style = asString(layer?.style?.font?.style, '')
    const syntheticPSN = Boolean(!psNameRaw && family && family.length > 0 && style)
    const postScriptName = syntheticPSN ? this._constructSyntheticPSN(family, style) : psNameRaw
    const paragraphSpacing = asNumber(layer?.style?.textAttributes?.paragraphAfterSpacing, 0)
    const underline = decorations.includes('underline') ? 'SINGLE' : 'NONE'

    return {
      bold: DEFAULTS.TEXT.STYLE_BOLD,
      italic: DEFAULTS.TEXT.STYLE_ITALIC,
      smallcaps: DEFAULTS.TEXT.STYLE_SMALLCAPS,
      kerning: DEFAULTS.TEXT.STYLE_KERNING,
      paragraphSpacing,
      name: family,
      type: style,
      size: layer?.style?.font?.size,
      postScriptName,
      letterSpacing: Number.isNaN(letterSpacing) ? undefined : letterSpacing,
      lineHeight: layer?.style?.textAttributes?.lineHeight,
      syntheticPostScriptName: syntheticPSN,
      underline,
      linethrough: decorations.includes('line-through'),
    } as const
  }

  private _parseParagraphWideRange(range: MergedTextStyle) {
    const layerFontSize = asNumber(
      this._sourceLayer.raw?.style?.font?.size,
      asNumber(range?.metaUxStyle?.fontSize, DEFAULTS.TEXT.LAYER_FONT_SIZE)
    )

    const decorations = asArray(range?.style?.textAttributes?.decoration)
    const fontLetterSpacing = asNumber(range?.style?.textAttributes?.letterSpacing, 0)
    const fontSize = asNumber(range?.style?.font?.size, layerFontSize)
    const letterSpacing = (fontLetterSpacing * fontSize) / 1000
    const textTransform = range?.metaUxStyle?.textTransform
    /**
     * Some props occurs twice - in paragraph styles and in ranged styles.
     * Trying to fallback on the one another in case of missing props.
     */
    const psNameRaw = asString(range?.style?.font?.postscriptName, asString(range?.metaUxStyle?.postscriptName, ''))
    const family = asString(range?.style?.font?.family, asString(range?.metaUxStyle?.fontFamily, ''))
    const style = asString(range?.style?.font?.style, asString(range?.metaUxStyle?.fontStyle, ''))
    const syntheticPSN = Boolean(!psNameRaw && family && family.length > 0 && style)
    const postScriptName = syntheticPSN ? this._constructSyntheticPSN(family, style) : psNameRaw
    const underline = decorations.includes('underline') ? 'SINGLE' : 'NONE'
    const letterCase = this._getLetterCase(textTransform)

    return {
      name: family,
      type: style,
      size: range?.style?.font?.size,
      postScriptName: postScriptName,
      lineHeight: range?.style?.textAttributes?.lineHeight,
      syntheticPostScriptName: syntheticPSN,
      letterSpacing: Number.isNaN(letterSpacing) ? undefined : letterSpacing,
      underline,
      linethrough: decorations.includes('line-through'),
      letterCase,
    } as const
  }

  private _getTextValue() {
    return this._sourceLayer.textValue
  }

  private _getDefaultStyle(): Octopus['TextStyle'] | null {
    const layerWideProps = this._parseLayerWideRange(this._sourceLayer.raw)

    const optionalFontProps = getPresentProps(
      {
        family: layerWideProps.name,
        style: layerWideProps.type,
        syntheticPostScriptName: layerWideProps.syntheticPostScriptName,
      },
      ['']
    )

    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return null

    const { fills, strokes } = OctopusEffectsText.fromTextLayer({
      octopusLayer: this,
    }).convert()

    const optionalDefaultStyleProps = getPresentProps({
      fontSize: layerWideProps.size,
      lineHeight: layerWideProps.lineHeight,
      letterSpacing: layerWideProps.letterSpacing,
      kerning: layerWideProps.kerning,
      underline: layerWideProps.underline,
      linethrough: layerWideProps.linethrough,
      ...(fills ? { fills } : null),
      ...(strokes ? { strokes } : null),
    })

    return {
      font: {
        postScriptName: layerWideProps.postScriptName,
        ...optionalFontProps,
      },
      ...optionalDefaultStyleProps,
    }
  }

  private _getTranslationMatrix(tx: number, ty: number) {
    const hasTranslation = typeof tx === 'number' && typeof ty === 'number'
    const zeroTranslation = tx === ty && tx === 0
    return !zeroTranslation && hasTranslation ? { a: 1, b: 0, c: 0, d: 1, tx, ty } : null
  }

  private _getArtboardOffset() {
    const defaultOffset = { x: 0, y: 0 }
    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return defaultOffset
    const ref = this.parentArtboard?.sourceArtboard.raw.children?.[0].artboard?.ref
    if (!ref) return defaultOffset
    const artboardMeta = resources.raw.artboards?.[ref]
    if (!artboardMeta) return defaultOffset
    const x = asNumber(artboardMeta.x, 0)
    const y = asNumber(artboardMeta.y, 0)
    return { x, y }
  }

  private _getParagraphOffset() {
    const offsetParagraph = this._sourceLayer.raw?.text?.paragraphs?.[0]?.lines?.[0]?.[0]
    const x = Math.round(asNumber(offsetParagraph?.x, 0))
    const y = Math.round(asNumber(offsetParagraph?.y, 0))
    return { x, y }
  }

  private _getOffsetMatrixParagraph() {
    const { x: paraOffsetX, y: paraOffsetY } = this._getParagraphOffset()
    const paragraphAlign = this._sourceLayer.raw?.style?.textAttributes?.paragraphAlign || 'left'
    const paraAlignMod = { left: 0, center: 0.5, right: 1 }[paragraphAlign] ?? 0
    const frameWidth = asNumber(this._sourceLayer.raw?.text?.frame?.width, 0)
    const paraOffsetXTweaked =
      this._sourceLayer.raw?.text?.frame?.type === 'autoHeight' ? frameWidth * paraAlignMod + paraOffsetX : paraOffsetX
    return this._getTranslationMatrix(paraOffsetXTweaked, paraOffsetY)
  }

  private _getTextTransform(): Octopus['Transform'] | null {
    const offsetMatrixParagraph = this._getOffsetMatrixParagraph()

    const offset = this._getArtboardOffset()
    if (!offset) return null

    // Current layer matrix.
    const matrices = [DEFAULTS.TRANSFORM.slice(), convertObjectMatrixToArray(offsetMatrixParagraph)]
      .filter((matrix) => {
        return Array.isArray(matrix)
      })
      .map((matrix) => {
        const [a, b, c, d, tx, ty] = matrix as number[]
        return createMatrix(a, b, c, d, tx, ty)
      })

    const { a, b, c, d, tx, ty } = matrices.reduce((matrix, current) => matrix.append(current))
    return [a, b, c, d, tx, ty]
  }

  private _getFlatParagraphs() {
    const paragraphs = asArray(this._sourceLayer.raw?.text?.paragraphs)
    return paragraphs.reduce((result, line) => {
      const current = asArray(line?.lines).reduce((current, line) => {
        return Array.isArray(line) ? push(current, ...line) : current
      })
      return push(result, ...current)
    }, [])
  }

  private _getParagraphStyle(paragraph: MergedTextStyle): Octopus['TextStyle'] | null {
    const paragraphWideProps = this._parseParagraphWideRange(paragraph)

    const optionalFontProps = getPresentProps(
      {
        family: paragraphWideProps.name,
        style: paragraphWideProps.type,
        syntheticPostScriptName: paragraphWideProps.syntheticPostScriptName,
      },
      ['']
    )

    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return null

    const { fills, strokes } = new OctopusEffectsText({
      effectSource: paragraph.style,
    }).convert()

    const optionalDefaultStyleProps = getPresentProps({
      fontSize: paragraphWideProps.size,
      lineHeight: paragraphWideProps.lineHeight,
      letterSpacing: paragraphWideProps.letterSpacing,
      // kerning: paragraphWideProps.kerning,
      underline: paragraphWideProps.underline,
      linethrough: paragraphWideProps.linethrough,
      letterCase: paragraphWideProps.letterCase,
      ...(fills ? { fills } : null),
      ...(strokes ? { strokes } : null),
    })

    return {
      font: {
        postScriptName: paragraphWideProps.postScriptName,
        ...optionalFontProps,
      },
      ...optionalDefaultStyleProps,
    }
  }

  private _parseRange(paragraph: MergedTextStyle): Octopus['StyleRange'] | null {
    const paragraphStyle = this._getParagraphStyle(paragraph)
    if (!paragraphStyle) return null
    const range = { from: paragraph.from, to: paragraph.to }
    return { style: paragraphStyle, ranges: [range] }
  }

  private _getStyles(textValue: string): Octopus['StyleRange'][] {
    const paragraphs = this._getFlatParagraphs()
    const rangedStyles = this._getNormalizedRangedStyles(textValue.length)
    const textStyles = this._mergeMetaToParagraphs(paragraphs, rangedStyles)
    return textStyles
      .map((paragraph) => {
        return this._parseRange(paragraph)
      })
      .filter((parsedRange) => {
        return parsedRange
      }) as Octopus['StyleRange'][]
  }

  private _getFrame(): Octopus['TextFrame'] {
    const raw = this._sourceLayer.raw
    const frameType = raw?.text?.frame?.type
    const shouldHaveFrame = frameType === 'area' || frameType === 'autoHeight'
    if (shouldHaveFrame) {
      return {
        mode: ({ area: 'FIXED', autoHeight: 'AUTO_HEIGHT' } as const)[frameType],
        size: {
          width: asNumber(raw?.text?.frame?.width, 1),
          height: asNumber(raw?.text?.frame?.height, 1),
        },
      }
    }
    return {
      mode: 'AUTO_WIDTH',
    }
  }

  private _getHorizontalAlign() {
    const align = this._sourceLayer.raw?.style?.textAttributes?.paragraphAlign ?? 'left'
    return ({ left: 'LEFT', right: 'RIGHT', center: 'CENTER' } as const)[align]
  }

  private get _text(): Octopus['Text'] | null {
    const value = this._getTextValue()
    if (typeof value !== 'string') return null
    const defaultStyle = this._getDefaultStyle()
    if (!defaultStyle) return null
    const transform = this._getTextTransform()
    if (!transform) return null
    const styles = this._getStyles(value)
    const frame = this._getFrame()
    const horizontalAlign = this._getHorizontalAlign()

    const text: Octopus['Text'] = {
      value,
      defaultStyle,
      baselinePolicy: 'SET',
      transform,
      ...(styles.length ? { styles } : null),
      frame,
      horizontalAlign,
    }
    return normalizeText(text)
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this._text
    if (!text) return null
    return { type: 'TEXT', text }
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return {
      ...common,
      ...specific,
    }
  }
}
