import { keys } from '@opendesign/octopus-common/utils/common'

export function _inferPostScriptType(weight: number | undefined): string {
  if (!weight) return 'Regular'

  const types: { [key: string]: string } = {
    '100': 'Thin',
    '200': 'UltraLight',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semibold',
    '700': 'Bold',
    '800': 'ExtraBold',
    '900': 'Black',
  }

  const pair = keys(types).reduce((pair, type, index, arr) => {
    if (!pair) {
      if (index === arr.length - 1) return null
      const next = arr[index + 1]
      if (Number(type) <= weight && Number(next) >= weight) {
        return [type, next]
      }
    }
    return pair
  }, null)

  if (pair === null) return 'Regular'

  return weight - Number(pair[0]) > Number(pair[1]) - weight ? types[pair[1]] : types[pair[0]]
}

function _inferPostScriptStyle({ fontStyle, fontWeight, italic }: InferPostScriptNameOptions): string {
  if (typeof fontStyle === 'string') {
    return fontStyle.replace(/\s/g, '').replace(/Regular/, '')
  }
  const type = _inferPostScriptType(fontWeight).replace(/Regular/, '')
  return italic ? `${type}Italic` : type
}

export type InferPostScriptNameOptions = {
  fontFamily?: string
  fontStyle?: string
  fontWeight?: number
  italic?: boolean
}
export function inferPostScriptName(options: InferPostScriptNameOptions): string | null {
  const { fontFamily } = options
  if (typeof fontFamily !== 'string') return null
  const font = fontFamily.replace(/\s/g, '')
  const style = _inferPostScriptStyle(options)
  return style ? `${font}-${style}` : font
}
