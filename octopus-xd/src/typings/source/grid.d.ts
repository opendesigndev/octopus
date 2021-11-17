import { RawColor } from './color'

export type RawGridStroke = {
  type?: string,
  color?: RawColor
}

export type RawGridStyle = {
  rowStroke?: RawGridStroke,
  columnStroke?: RawGridStroke,
  rowSpacing?: number,
  columnSpacing?: number,
  defaultLayoutWidth?: number,
  columns?: number,
  gutter?: number,
  marginLeft?: number,
  marginTop?: number,
  marginRight?: number,
  marginBottom?: number,
  layoutRowStroke?: RawGridStroke,
  layoutColumnStroke?: RawGridStroke
  /**
   * @TODO decide how to infer visibility
   * `visible` doens't occur in newer xd version, seems like it's somewhat deprecated.
   */
  visible?: boolean
}