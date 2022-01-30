import { RawColor, RawTransform } from '.'

export type RawGradientStop = {
  offset?: number,
  color?: RawColor
}

export type RawGradientResources = {
  type?: 'linear' | 'radial',
  stops?: RawGradientStop[]
}

export type RawGradientLinear = {
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

export type RawGradientRadial = {
  meta?: {
    ux?: {
      gradientResources?: RawGradientResources
    }
  },
  cx?: number,
  cy?: number,
  fx?: number,
  fy?: number,
  r?: number,
  units?: 'objectBoundingBox',
  ref?: string,
  transform?: RawTransform
}

export type RawGradientFill = {
  type?: 'gradient' | 'none',
  gradient?: RawGradientLinear | RawGradientRadial
}