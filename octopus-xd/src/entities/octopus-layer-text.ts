import isEqual from 'lodash/isEqual'
import OctopusLayerCommon, { OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../typings/octopus'
import SourceLayerText from './source-layer-text'
import { RawRangedStyle, RawTextLayer, RawTextParagraphRange } from '../typings/source'
import { asArray, asNumber, asString } from '../utils/as'
import { getPresentProps } from '../utils/common'
import defaults from '../utils/defaults'
import OctopusEffectsShape from './octopus-effects-shape'
import { createMatrix } from '../utils/paper'
import { convertObjectMatrixToArray } from '../utils/matrix'


type OctopusLayerTextOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayerText
}

type NormalizedRawRangedStyle = RawRangedStyle & {
  lengthFrom: number,
  lengthTo: number
}

type MergedTextStyle = RawTextParagraphRange & {
  from: number,
  to: number, 
  metaUxStyle: NormalizedRawRangedStyle | null
}

export default class OctopusLayerText extends OctopusLayerCommon {
  _parent: OctopusLayerParent
  _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  _removeWhitespaces(str: string): string {
    return str.replace(/\s+/g, '')
  }

  /** @TODO extend types with CAPITALIZE */
  _getLetterCase(rawLetterCase: NormalizedRawRangedStyle['textTransform']) {
    switch (rawLetterCase) {
      case 'lowercase': {
        return 'LOWERCASE'
      }
      case 'uppercase': {
        return 'UPPERCASE'
      }
      // case 'titlecase': {
      //   return 'CAPITALIZE'
      // }
    }
    return 'NONE'
  }
  
  /** @TODO should we construct synthetic psns in opendesign? */
  _constructSyntheticPSN(familyRaw: string, styleRaw: string): string {
    const family = this._removeWhitespaces(familyRaw)
    const style = this._removeWhitespaces(styleRaw)

    return style.length > 0 ? `${ family }-${ style }` : family
  }

  _getUniqueSortedStops(paragraphs: RawTextParagraphRange[], meta: NormalizedRawRangedStyle[]) {
    const paragraphsStops = paragraphs.reduce((stops, paragraph) => {
      return [
        ...stops,
        asNumber(paragraph?.from, 0),
        asNumber(paragraph?.to, 0)
      ]
    }, [])

    const metaStops = meta.reduce((stops, meta) => {
      return [
        ...stops,
        asNumber(meta?.lengthFrom, 0),
        asNumber(meta?.lengthTo, 0)
      ]
    }, [])
  
    return [...new Set([ ...paragraphsStops, ...metaStops ])].sort((a, b) => a - b)
  }

  _getNormalizedRangedStyles(textLength: number): NormalizedRawRangedStyle[] {
    const raw = this._sourceLayer.raw as RawTextLayer
    const styles = asArray(raw?.meta?.ux?.rangedStyles)
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

  _mergeMetaToParagraphs(
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
        metaUxStyle: matchingMeta || null
      }
      return [...ranges, merged]
    }, [])
  }
  
  _parseLayerWideRange(layer: RawTextLayer) {
    const decorations = asArray(layer?.style?.textAttributes?.decoration)
    const fontLetterSpacing = asNumber(layer?.style?.textAttributes?.letterSpacing, 0)
    const fontSize = asNumber(layer?.style?.font?.size, defaults.TEXT.LAYER_FONT_SIZE)
    const letterSpacing = fontLetterSpacing * fontSize / 1000
    const psNameRaw = asString(layer?.style?.font?.postscriptName, '')
    const family = asString(layer?.style?.font?.family, '')
    const style = asString(layer?.style?.font?.style, '')
    const syntheticPSN = Boolean(!psNameRaw && family && family.length > 0 && style)
    const postScriptName = syntheticPSN ? this._constructSyntheticPSN(family, style) : psNameRaw
    const paragraphSpacing = asNumber(layer?.style?.textAttributes?.paragraphAfterSpacing, 0)
    const underline = decorations.includes('underline') ? 'SINGLE' : 'NONE'

    return {
      bold: defaults.TEXT.STYLE_BOLD,
      italic: defaults.TEXT.STYLE_ITALIC,
      smallcaps: defaults.TEXT.STYLE_SMALLCAPS,
      kerning: defaults.TEXT.STYLE_KERNING,
      paragraphSpacing,
      name: family,
      type: style,
      size: layer?.style?.font?.size,
      postScriptName,
      letterSpacing: Number.isNaN(letterSpacing) ? undefined : letterSpacing,
      lineHeight: layer?.style?.textAttributes?.lineHeight,
      syntheticPostScriptName: syntheticPSN,
      underline,
      linethrough: decorations.includes('line-through')
    } as const
  }

  _parseParagraphWideRange(range: MergedTextStyle) {
    /** @TODO text styles should be ok even w/o any required props like psn? */

    const layer = this._sourceLayer.raw as RawTextLayer
    const layerFontSize = asNumber(layer?.style?.font?.size, defaults.TEXT.LAYER_FONT_SIZE)
    
    const decorations = asArray(range?.style?.textAttributes?.decoration)
    const fontLetterSpacing = asNumber(range?.style?.textAttributes?.letterSpacing, 0)
    const fontSize = asNumber(range?.style?.font?.size, layerFontSize)
    const letterSpacing = fontLetterSpacing * fontSize / 1000
    const textTransform = range?.metaUxStyle?.textTransform
    const psNameRaw = asString(range?.style?.font?.postscriptName, '')
    const family = asString(range?.style?.font?.family, '')
    const style = asString(range?.style?.font?.style, '')
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
      letterCase
      /** 
       * @TODO confirm if it fits 
       * capitalize: textTransform === 'titlecase'
       * */
    } as const
  }

  _getTextValue() {
    return this._sourceLayer.textValue
  }

  _getDefaultStyle(): Octopus['TextStyle'] | null {
    const layerWideProps = this._parseLayerWideRange(this._sourceLayer.raw as RawTextLayer)

    const optionalFontProps = getPresentProps({
      family: layerWideProps.name,
      style: layerWideProps.type,
      syntheticPostScriptName: layerWideProps.syntheticPostScriptName
    }, [''])

    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return null

    const { fills, strokes } = new OctopusEffectsShape({
      sourceLayer: this._sourceLayer,
      resources
    }).convert()

    const optionalDefaultStyleProps = getPresentProps({
      fontSize: layerWideProps.size,
      lineHeight: layerWideProps.lineHeight,
      letterSpacing: layerWideProps.letterSpacing,
      kerning: layerWideProps.kerning,

      /** 
       * @TODO An array of OpenType features configuration. - need more info
       * features?: components['schemas']['OpenTypeFeature'][]
       * */

      /**
       * @TODO ligatures in xd?
       */

      underline: layerWideProps.underline,
      linethrough: layerWideProps.linethrough,
      ...(fills ? { fills } : null),
      ...(strokes ? { strokes } : null)
    })

    return {
      font: {
        postScriptName: layerWideProps.postScriptName,
        ...optionalFontProps
      },
      ...optionalDefaultStyleProps
    }
  }

  _getTranslationMatrix(tx: number, ty: number) {
    const hasTranslation = typeof tx === 'number' && typeof ty === 'number'
    const zeroTranslation = tx === ty && tx === 0
    return (!zeroTranslation && hasTranslation) ? {a: 1, b: 0, c: 0, d: 1, tx, ty} : null
  }

  _getArtboardOffset() {
    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return null
    const ref = this.parentArtboard?.sourceArtboard.raw.children?.[0].artboard?.ref
    if (!ref) return null
    const artboardMeta = resources.raw.artboards?.[ref]
    if (!artboardMeta) return null
    const x = asNumber(artboardMeta.x, 0)
    const y = asNumber(artboardMeta.y, 0)
    return {x, y}
  }

  _getParagraphOffset() {
    const raw = this._sourceLayer.raw as RawTextLayer
    const offsetParagraph = raw?.text?.paragraphs?.[0]?.lines?.[0]?.[0]
    const x = Math.round(asNumber(offsetParagraph?.x, 0))
    const y = Math.round(asNumber(offsetParagraph?.y, 0))
    return { x, y }
  }

  _getOffsetMatrixParagraph() {
    const raw = this._sourceLayer.raw as RawTextLayer
    const { x: paraOffsetX, y: paraOffsetY } = this._getParagraphOffset()
    const paragraphAlign = raw?.style?.textAttributes?.paragraphAlign || 'left'
    const paraAlignMod = { left: 0, center: 0.5, right: 1 }[ paragraphAlign ] ?? 0
    const frameWidth = asNumber(raw?.text?.frame?.width, 0)
    const paraOffsetXTweaked = raw?.text?.frame?.type === 'autoHeight'
      ? frameWidth * paraAlignMod + paraOffsetX
      : paraOffsetX
    return this._getTranslationMatrix(paraOffsetXTweaked, paraOffsetY)
  }

  _getTextTransform(): Octopus['TextTransform'] | null {
    const parentMatrices = this.parentLayers.map(parent => parent.transform)
    const raw = this._sourceLayer.raw as RawTextLayer
    const offsetMatrixParagraph = this._getOffsetMatrixParagraph()
    
    const offset = this._getArtboardOffset()
    if (!offset) return null
    const offsetMatrixArtboard = this._getTranslationMatrix(-offset.x, -offset.y)

    // Current layer matrix.
    const offsetMatrixLayer = raw?.transform
    const matrices = [
      convertObjectMatrixToArray(offsetMatrixArtboard),
      ...parentMatrices,
      convertObjectMatrixToArray(offsetMatrixLayer),
      convertObjectMatrixToArray(offsetMatrixParagraph)
    ].filter((matrix) => {
      return Array.isArray(matrix)
    }).map((matrix) => {
      const [a, b, c, d, tx, ty] = matrix as number[]
      return createMatrix(a, b, c, d, tx, ty)
    })
    const { a, b, c, d, tx, ty } = matrices.reduce((matrix, current) => matrix.append(current))

    return {
      /** @TODO test / clarify value: 'LAYER' | 'ARTBOARD' */
      origin: 'ARTBOARD',
      transform: [ a, b, c, d, tx, ty ],
      type: undefined /** @TODO remove with fixed types */
    }
  }

  _getFlatParagraphs() {
    const raw = this._sourceLayer.raw as RawTextLayer
    const paragraphs = asArray(raw?.text?.paragraphs)
    return paragraphs.reduce((result, line) => {
      const current = asArray(line?.lines).reduce((current, line) => {
        return Array.isArray(line) ? [...current, ...line] : current
      })
      return [...result, ...current]
    }, [])
  }

  _getParagraphStyle(paragraph: MergedTextStyle): Octopus['TextStyle'] | null {
    const paragraphWideProps = this._parseParagraphWideRange(paragraph)

    const optionalFontProps = getPresentProps({
      family: paragraphWideProps.name,
      style: paragraphWideProps.type,
      syntheticPostScriptName: paragraphWideProps.syntheticPostScriptName
    }, [''])

    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return null

    const { fills, strokes } = new OctopusEffectsShape({
      fallbackSource: paragraph.style,
      resources
    }).convert()

    const optionalDefaultStyleProps = getPresentProps({
      fontSize: paragraphWideProps.size,
      lineHeight: paragraphWideProps.lineHeight,
      letterSpacing: paragraphWideProps.letterSpacing,
      // kerning: paragraphWideProps.kerning,

      /** 
       * @TODO An array of OpenType features configuration. - need more info
       * features?: components['schemas']['OpenTypeFeature'][]
       * */

      /**
       * @TODO ligatures in xd?
       */

      underline: paragraphWideProps.underline,
      linethrough: paragraphWideProps.linethrough,
      letterCase: paragraphWideProps.letterCase,
      ...(fills ? { fills } : null),
      ...(strokes ? { strokes } : null)
    })

    return {
      font: {
        postScriptName: paragraphWideProps.postScriptName,
        ...optionalFontProps
      },
      ...optionalDefaultStyleProps
    }
  }

  _parseRange(paragraph: MergedTextStyle): Octopus['StyleRange'] | null {
    const paragraphStyle = this._getParagraphStyle(paragraph)
    if(!paragraphStyle) return null
    const range = { from: paragraph.from, to: paragraph.to }
    return { style: paragraphStyle, ranges: [ range ] }
  }

  _mergeRanges(ranges: Octopus['StyleRange'][]): Octopus['StyleRange'][] {
    const unique = ranges.reduce((unique: Octopus['StyleRange'][], range) => {
      return unique.every((uniqueRange) => isEqual(uniqueRange.style, range.style))
        ? [ ...unique, range ]
        : unique
    }, [])
    return unique.map((uniqueRange) => {
      return {
        ...uniqueRange,
        ranges: ranges
          .filter((range) => isEqual(uniqueRange.style, range.style))
          .reduce((ranges, range) => {
            return [ ...ranges, ...asArray(range.ranges) ]
          }, [])
      }
    })
  }

  _getStyles(textValue: string) {
    const paragraphs = this._getFlatParagraphs()
    const rangedStyles = this._getNormalizedRangedStyles(textValue.length)
    const textStyles = this._mergeMetaToParagraphs(paragraphs, rangedStyles)
    const parsedRanges = textStyles.map((paragraph) => {
      return this._parseRange(paragraph)
    }).filter((parsedRange) => {
      return parsedRange
    }) as Octopus['StyleRange'][]
    return this._mergeRanges(parsedRanges)
  }

  _getFrame(): Octopus['TextFrame'] {
    const raw = this._sourceLayer.raw as RawTextLayer
    const frameType = raw?.text?.frame?.type
    const shouldHaveFrame = frameType === 'area' || frameType === 'autoHeight'
    if (shouldHaveFrame) {
      return {
        mode: ({ area: 'FIXED', autoHeight: 'AUTO_HEIGHT' } as const)[ frameType ],
        size: {
          width: asNumber(raw?.text?.frame?.width, 1),
          height: asNumber(raw?.text?.frame?.height, 1)
        }
      }
    }
    return {
      /** @TODO doublecheck if modes are correct */
      mode: 'AUTO_WIDTH'
    }
  }

  _getHorizontalAlign() {
    const raw = this._sourceLayer.raw as RawTextLayer
    const align = raw?.style?.textAttributes?.paragraphAlign ?? 'left'
    return ({ left: 'LEFT', right: 'RIGHT', center: 'CENTER' } as const)[ align ]
  }

  _getText(): Octopus['Text'] | null {
    const value = this._getTextValue()
    if (typeof value !== 'string') return null
    const defaultStyle = this._getDefaultStyle()
    if (!defaultStyle) return null
    const parseTextTransform = this._getTextTransform()
    if (!parseTextTransform) return null
    const styles = this._getStyles(value)
    const frame = this._getFrame()
    const horizontalAlign = this._getHorizontalAlign()
    
    /** @TODO do we want octopus-common normalizations in octopus 3? */

    return {
      value,
      defaultStyle,
      /** @TODO clarify what's the desired value for Adobe XD */
      baselinePolicy: 'SET',
      /** @TODO how textTransform differs from layer's transform? */
      textTransform: parseTextTransform,
      ...(styles.length ? { styles } : null),
      frame,
      horizontalAlign
      // /** Text vertical alignment relative to the whole layer. */
      // verticalAlign?: 'TOP' | 'CENTER' | 'BOTTOM'      
    }
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns 
   */
  convertTypeSpecific() {
    const text = this._getText()
    if (!text) return null

    return {
      text
    }
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this.convertTypeSpecific()
    if (!specific) return null

    return {
      ...common,
      ...specific
    }
  }
}
