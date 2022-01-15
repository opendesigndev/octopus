import { asBoolean, asNumber } from '../utils/as'
import { parseXDColor } from '../utils/color'
import { round } from '../utils/common'
import OctopusBounds from './octopus-bounds'

import type OctopusArtboard from './octopus-artboard'


type OctopusArtboardGridOptions = {
  octopusArtboard: OctopusArtboard
}
export default class OctopusArtboardGrid {
  private _octopusArtboard: OctopusArtboard

  constructor(options: OctopusArtboardGridOptions) {
    this._octopusArtboard = options.octopusArtboard
  }

  private _getGridStyle() {
    return this._octopusArtboard.sourceArtboard.firstChild?.meta?.ux?.gridStyle || null
  }

  private _convertColumnGrid() {
    const style = this._getGridStyle()
    if (!style) return null
    
    const { width, height } = {
      width: asNumber(this._octopusArtboard.sourceArtboard.meta['uxdesign#bounds']?.width),
      height: asNumber(this._octopusArtboard.sourceArtboard.meta['uxdesign#bounds']?.height)
    }

    const [ top, left, right, bottom, count, gutter ] = [
      style?.marginTop,
      style?.marginLeft,
      style?.marginRight,
      style?.marginBottom,
      style?.columns,
      style?.gutter
    ].map(n => asNumber(n, 0))

    const bounds = OctopusBounds.from(
      left,
      top,
      width - right - left,
      height - bottom - top
    ).convert()
  
    const size = round((width - (left + right) - (count - 1) * gutter) / count)
    const visible = asBoolean(style.visible, false)
    const color = parseXDColor(style?.layoutColumnStroke?.color)

    return {
      type: 'COLUMN',
      outerOutline: true,
      bounds,
      size,
      count,
      color,
      visible
    }
  }

  private _convertGrid() {
    const style = this._getGridStyle()
    if (!style) return null

    const [ rowSpacing, columnSpacing ] = [
      style?.rowSpacing,
      style?.columnSpacing
    ].map(n => asNumber(n, 0))
    
    if (rowSpacing !== columnSpacing) return null
  
    const visible = asBoolean(style.visible, false)
    const color = parseXDColor(style?.rowStroke?.color)

    return {
      type: 'GRID',
      thickEvery: 0,
      size: rowSpacing,
      color,
      visible
    }
  }

  convert() {
    const column = this._convertColumnGrid()
    const grid = this._convertGrid()
    return [ column, grid ].filter(grid => grid)
  }
}