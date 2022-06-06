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

  const pair = Object.keys(types).reduce((pair, type, index, arr) => {
    if (!pair) {
      if (index === arr.length - 1) return null
      const next = arr[index + 1]
      if (+type <= weight && +next >= weight) {
        return [type, next]
      }
    }
    return pair
  }, null)

  if (pair === null) return 'Regular'

  return weight - Number(pair[0]) > Number(pair[1]) - weight ? types[pair[1]] : types[pair[0]]
}

export type InferPostScriptNameOptions = { fontFamily?: string; weight?: number; italic?: boolean }
export function inferPostScriptName({ fontFamily, weight, italic }: InferPostScriptNameOptions): string | null {
  if (typeof fontFamily !== 'string') return null
  const font = fontFamily.replace(/\s/g, '')
  const inferType = _inferPostScriptType(weight)
  const type = inferType === 'Regular' ? '' : inferType
  const _italic = italic ? 'Italic' : ''
  return [font, type, _italic].filter((str) => str).join('-')
}
