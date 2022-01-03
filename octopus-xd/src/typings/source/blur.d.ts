export type RawBlur = {
  type?: 'uxdesign#blur',
  global?: boolean,
  params?: {
    blurAmount?: number,
    brightnessAmount?: number,
    fillOpacity?: number,
    backgroundEffect?: boolean
  },
  visible?: boolean
}