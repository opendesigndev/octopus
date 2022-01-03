import { RawColor } from '.'

export type RawGradientStop = {
  offset?: number,
  color?: RawColor
}

export type RawGradientResources = {
  type?: 'linear',
  stops?: RawGradientStop[]
}

export type RawGradientFill = {
  type?: 'gradient' | 'none',
  gradient?: {
    meta?: {
      ux?: {
        gradientResources?: RawGradientResources
      }
    },
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,
    units?: 'objectBoundingBox',
    ref?: string
  }
}