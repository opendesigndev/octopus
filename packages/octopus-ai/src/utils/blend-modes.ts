import type { Octopus } from '../typings/octopus'

export const BLEND_MODES: { [key: string]: Octopus['BlendMode'] } = {
  // could not find passThrough in illustrator. keeping it just in case
  PassThrough: 'PASS_THROUGH',
  Normal: 'NORMAL', // updated
  Darken: 'DARKEN',
  Multiply: 'MULTIPLY',
  ColorBurn: 'COLOR_BURN',
  Lighten: 'LIGHTEN',
  Screen: 'SCREEN',
  ColorDodge: 'COLOR_DODGE',
  Overlay: 'OVERLAY',
  SoftLight: 'SOFT_LIGHT',
  HardLight: 'HARD_LIGHT',
  Difference: 'DIFFERENCE',
  Exclusion: 'EXCLUSION',
  Hue: 'HUE',
  Saturation: 'SATURATION',
  Color: 'COLOR',
  Luminosity: 'LUMINOSITY',
} as const
