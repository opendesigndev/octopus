const BLEND_MODES = {
  fdiv: 'DIVIDE',
  fsub: 'SUBTRACT',
  colr: 'COLOR',
  idiv: 'COLOR_BURN',
  'div ': 'COLOR_DODGE',
  div: 'COLOR_DODGE',
  dark: 'DARKEN',
  dkCl: 'DARKER_COLOR',
  diff: 'DIFFERENCE',
  smud: 'EXCLUSION',
  hLit: 'HARD_LIGHT',
  hMix: 'HARD_MIX',
  'hue ': 'HUE',
  hue: 'HUE',
  lite: 'LIGHTEN',
  lgCl: 'LIGHTER_COLOR',
  lbrn: 'LINEAR_BURN',
  lddg: 'LINEAR_DODGE',
  lLit: 'LINEAR_LIGHT',
  'lum ': 'LUMINOSITY',
  lum: 'LUMINOSITY',
  'mul ': 'MULTIPLY',
  mul: 'MULTIPLY',
  norm: 'NORMAL',
  over: 'OVERLAY',
  pass: 'PASS_THROUGH',
  pLit: 'PIN_LIGHT',
  'sat ': 'SATURATION',
  sat: 'SATURATION',
  scrn: 'SCREEN',
  sLit: 'SOFT_LIGHT',
  vLit: 'VIVID_LIGHT',
  Nrml: 'NORMAL',
  CBrn: 'COLOR_BURN',
  CDdg: 'COLOR_DODGE',
  'Clr ': 'COLOR',
  Clr: 'COLOR',
  Dfrn: 'DIFFERENCE',
  Drkn: 'DARKEN',
  // Dslv: 'dissolve', // no such type in OCTOPUS
  'H   ': 'HUE',
  H: 'HUE',
  HrdL: 'HARD_LIGHT',
  Lghn: 'LIGHTEN',
  Lmns: 'LUMINOSITY',
  Ovrl: 'OVERLAY',
  SftL: 'SOFT_LIGHT',
  Strt: 'SATURATION',
  Xclu: 'EXCLUSION',
  blendDivide: 'DIVIDE',
  blendSubtraction: 'SUBTRACT',
  darkerColor: 'DARKER_COLOR',
  hardMix: 'HARD_MIX',
  lighterColor: 'LIGHTER_COLOR',
  linearBurn: 'LINEAR_BURN',
  linearDodge: 'LINEAR_DODGE',
  linearLight: 'LINEAR_LIGHT',
  Mltp: 'MULTIPLY',
  pinLight: 'PIN_LIGHT',
  Scrn: 'SCREEN',
  vividLight: 'VIVID_LIGHT',
} as const

export default BLEND_MODES

export function isBlendMode(rawBlendMode: string | undefined): rawBlendMode is keyof typeof BLEND_MODES {
  return rawBlendMode ? rawBlendMode in BLEND_MODES : false
}
