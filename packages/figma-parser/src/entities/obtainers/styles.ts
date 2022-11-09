import fromPairs from 'lodash/fromPairs'

import { keys, without } from '../../utils/common'

import type { Parser } from '../../parser'
import type { ICacher } from '../../types/cacher'
import type { FigmaLayer } from '../../types/figma'
import type { Node } from '../structural/node'
import type { Design } from './design'
import type { FrameLike } from './frame-like'

type StylesOptions = {
  frameLike: FrameLike
}

export type Style = {
  id: string
  type: string
  source: FigmaLayer
}

export type ResolvedStyle = Style & {
  meta: {
    key: string
    name: string
    styleType: string
    description: string
  }
}

export default class Styles {
  _frameLike: FrameLike
  _styles: Style[]

  constructor(options: StylesOptions) {
    this._frameLike = options.frameLike
    this._styles = this._initStyles()
  }

  get parser(): Parser {
    return this._frameLike._design.parser
  }

  get design(): Design {
    return this._frameLike._design
  }

  get cacher(): ICacher | null {
    return this.parser.services.cacher
  }

  _parseStylesFromNodes(sourceNodes: Node[]): Style[] {
    const ids: string[] = []
    const targetLayers = sourceNodes.reduce<Style[]>((styles, node) => {
      const nodeStyles = node.flatLayers.reduce<Style[]>((nodeStyles, layer) => {
        const layerStyles = layer?.styles
        if (!layerStyles) return nodeStyles
        const source = without(layer, ['children'] as const) as FigmaLayer
        const sub = keys(layerStyles).reduce<Style[]>((styleMetas, styleType) => {
          const styleId = layerStyles?.[styleType]
          if (ids.includes(styleId)) return styleMetas
          ids.push(styleId)
          return [
            ...styleMetas,
            {
              id: styleId,
              type: styleType,
              source,
            },
          ]
        }, [])
        nodeStyles.push(...sub)
        return nodeStyles
      }, [])
      styles.push(...nodeStyles)
      return styles
    }, [])
    return targetLayers
  }

  private _initStyles(): ResolvedStyle[] {
    if (!this._frameLike._design.parser.config.shouldObtainStyles) return []

    const sourceNodes = [this._frameLike.node]
    const allStyles = this._parseStylesFromNodes(sourceNodes)
    const frameLikeStyles = this._frameLike.node.styles
    const allKeys = allStyles.map((style) => frameLikeStyles?.[style.id]?.key)
    const stylesMap = fromPairs(
      allStyles.map((style) => {
        return [frameLikeStyles?.[style.id]?.key, style]
      })
    ) as Record<string, Style>

    return allKeys.map((styleKey) => {
      const styleLocal = stylesMap[styleKey]
      const style: ResolvedStyle = {
        meta: frameLikeStyles?.[styleLocal.id],
        ...styleLocal,
      }
      this._frameLike._design.emit('ready:style', style)
      return style
    })
  }

  getStyles(): Style[] {
    return this._styles
  }
}
