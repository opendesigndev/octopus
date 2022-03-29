import type { Octopus } from '../typings/octopus-common'

function normalizeTextValue(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0003\u000b]/g, '\u2028').replace(/[\r\n]/g, '\u2029')
}

function normalizeRange(from: number, to: number, index: number): { from: number; to: number } {
  return {
    from: from <= index ? from : from - 1,
    to: to > index ? to - 1 : to,
  }
}

function normalizeRanges(styles: Octopus['StyleRange'][], index: number) {
  return styles.map((style) => {
    if (!Array.isArray(style.ranges)) return style
    return {
      ...style,
      ranges: style.ranges.map((range) => normalizeRange(range.from, range.to, index)),
    }
  })
}

function normalizeTextLinebreak(text: Octopus['Text']): Octopus['Text'] {
  if (typeof text.value !== 'string') return text
  const closestRnIndex = text.value.indexOf('\r\n')
  if (closestRnIndex === -1) return text
  return normalizeTextLinebreak({
    ...text,
    value: text.value.replace(/\r\n/, '\n'),
    styles: Array.isArray(text.styles) ? normalizeRanges(text.styles, closestRnIndex) : text.styles,
  })
}

export function normalizeLinebreak(text: Octopus['Text']): Octopus['Text'] {
  const textNormalized = normalizeTextLinebreak(text)
  return {
    ...textNormalized,
    value: normalizeTextValue(textNormalized.value),
  }
}
