import type { RawColor as RawColor } from './shared'
import type { UnitFloatDescriptorValue } from '@webtoon/psd-ts/dist/interfaces'

export type RawShapeTransparency = {
  Opct: number
  Lctn: number
  Mdpn: number
}

export type RawShapeGradientColor = {
  Clr: RawColor
  Type: string
  Lctn: number
  Mdpn: number
}

export type RawFillGradient = {
  Clrs: RawShapeGradientColor[]
  GrdF: string
  Intr: number
  Nm: string
  Trns: RawShapeTransparency[]
}

export type RawFillPattern = Partial<{
  Nm: string
  Idnt: string
}>

export type RawGradientType = 'Lnr ' | 'Rdl ' | 'Rflc' | 'Angl' | 'Dmnd'

export type RawGradientsInterpolationMethod = 'Perc' | 'Lnr ' | 'Gcls'

export type RawEffectCommon = {
  enab?: boolean
  present?: boolean
  showInDialog?: boolean
}

export type RawEffectShadow = RawEffectCommon &
  Partial<{
    Ckmt: number
    Md: string
    Clr: RawColor
    Opct: number
    uglg: boolean
    lagl: number
    Dstn: number
    blur: number
    TrnS: { Nm: string }
    layerConceals: boolean
  }>

export type RawEffectStrokeLineAlignment = 'outsetFrame' | 'insetFrame' | 'centeredFrame'

export type BevelEmbossStyle = 'OtrB' | 'InrB' | 'Embs' | 'PlEb' | 'strokeEmboss'
export type RawEffectBevelEmboss = RawEffectCommon &
  Partial<{
    bvlS: BevelEmbossStyle
    srgR: number
    blur: number
    Sftn: number
    lagl: number
    Lald: number
    hglM: string
    hglC: RawColor
    hglO: number
    sdwM: string
    sdwC: RawColor
    sdwO: number
  }>

export type RawEffectSatin = RawEffectCommon & {
  Clr: RawColor
  Invr: boolean
  Opct: number
  lagl: number
  Dstn: number
  blur: number
}

export type RawOffset = { Hrzn: UnitFloatDescriptorValue; Vrtc: UnitFloatDescriptorValue }

export type RawFill = RawEffectCommon &
  Partial<{
    Md: string
    Clr: RawColor
    Opct: number
    Grad: RawFillGradient
    Angl: number
    Type: RawGradientType
    Rvrs: boolean
    Dthr: boolean
    gs99: string
    Algn: boolean
    Scl: number
    Ofst: RawOffset
    Ptrn: RawFillPattern
    phase: RawOffset
  }>

export type RawEffectStroke = {
  enab: boolean
  present: boolean
  showInDialog: boolean
  Styl: string
  PntT: string
  Md: string
  Opct: number
  Sz: number
  Clr: RawColor
  Ptrn: RawFillPattern
  Scl: number
  Lnkd: boolean
  Angl: number
  phase: RawOffset
  overprint: boolean
}

export type RawlayerEffects = Partial<{
  masterFXSwitch: true
  DrSh: RawEffectShadow
  SoFi: RawFill
  GrFl: RawFill
  IrSh: RawEffectShadow
  IrGl: RawEffectShadow
  OrGl: RawEffectShadow
  patternFill: RawFill
  FrFX: RawEffectStroke
  ChFX: RawEffectSatin
  ebbl: RawEffectBevelEmboss
}>
