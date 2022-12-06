export const DEFAULTS = {
  BEZIER_KNOT_TYPE: [1, 2, 4, 5],
  PATH_RECORD_TYPE: [0, 3],
  OPEN_SUBPATH_TYPE: 0,
  CLOSED_SUBPATH_TYPE: 3,
  SUBPATH_OPERATION_NONE: -1,
  LAYER_TRANSFORM: [1, 0, 0, 1, 0, 0],
  BLEND_MODE: 'NORMAL',
  OPACITY: 1,
  RGB_COLOR_MAX_VALUE: 255,
  EFFECTS: {
    SHADOW_CHOKE: 0,
    IMAGE_FILL_TYPE: 'FILL',
    STROKE_JOIN: 'MITER',
    STROKE_CAP: 'BUTT',
    STROKE_POSITION: 'CENTER',
  },
  TEXT: {
    STYLE_BOLD: false,
    STYLE_ITALIC: false,
    STYLE_SMALLCAPS: false,
    STYLE_KERNING: true,
    LAYER_FONT_SIZE: 10,
    FONT_STYLE: 'Regular',
    FONT_STYLES: {
      '-Bold': 'Bold',
      '-BoldItalic': 'Bold Italic',
      '-Italic': 'Italic',
      '-Light': 'Light',
      '-Medium': 'Medium',
      '-Regular': 'Regular',
    },
  },
  LAYER: {
    NAME: 'Layer',
  },
  READER: {
    // some keys from reader can return percentage or integer values. we need to keep track
    // of such keys and return their unit type together with values
    KEYS_WITH_AMBIGUOUS_VALUES: ['Hrzn', 'Vrtc'] as string[],
  },
} as const
