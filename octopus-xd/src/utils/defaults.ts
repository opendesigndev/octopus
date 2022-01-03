export default {
  LAYER_TRANSFORM: [ 1, 0, 0, 1, 0, 0 ],
  BLEND_MODE: 'NORMAL' /** @TODO default is normal or pass_through? */,
  EFFECTS: {
    SHADOW_CHOKE: 0,
    IMAGE_FILL_TYPE: 'FILL',
    STROKE_JOIN: 'MITER',
    STROKE_CAP: 'BUTT',
    STROKE_POSITION: 'CENTER'
  },
  TEXT: {
    STYLE_BOLD: false,
    STYLE_ITALIC: false,
    STYLE_SMALLCAPS: false,
    STYLE_KERNING: true,
    LAYER_FONT_SIZE: 10
  }
} as const