export const DEFAULTS = {
  TRANSFORM: [1, 0, 0, 1, 0, 0],
  BLEND_MODE: 'NORMAL' as const,
  EMPTY_PATH: '',
  WINDING_RULE: 'NON_ZERO' as const,
  STROKE_ALIGN: 'CENTER' as const,
  STROKE_CAP: 'NONE' as const,
  STROKE_JOIN: 'MITER' as const,
  STROKE_MITER_ANGLE: 28.96,
  TEXT: {
    FONT_SIZE: 12,
    FONT_WEIGHT: 400,
    LETTER_SPACING: 0,
    LINE_HEIGHT_PERCENT: 100,
    LINE_HEIGHT_UNIT: 'INTRINSIC_%' as const,
  },
}
