import has from 'lodash/has.js'
import pick from 'lodash/pick.js'
import without from 'lodash/without.js'

import { asArray } from '../utils/as.js'
import { isObject, keys } from '../utils/common.js'

import type { Octopus } from '../typings/octopus-common/index.js'

function normalizeDefaultStyle(
  defaultStyle: Octopus['TextStyle'],
  prop: keyof Octopus['TextStyle'],
  value: unknown
): Octopus['TextStyle'] {
  return {
    ...defaultStyle,
    [prop]: value,
  }
}

function normalizeStyles(styles: Octopus['StyleRange'][], prop: keyof Octopus['TextStyle']): Octopus['StyleRange'][] {
  return styles.reduce((normalized, style) => {
    if (!isObject(style.style)) return [...normalized, style]
    const removeDefaultStyleProp = pick(style.style, without(keys(style.style), prop))
    if (!keys(removeDefaultStyleProp).length) {
      const styleProperties = keys(style)
      const hasAnyData = without(styleProperties, 'ranges', 'style').length
      if (!hasAnyData) return normalized
      const normalizedStyle = pick(style, without(styleProperties, 'style'))
      return [...normalized, normalizedStyle]
    }

    const normalizedStyle = {
      ...style,
      font: removeDefaultStyleProp,
    }

    return [...normalized, normalizedStyle]
  }, [])
}

function normalizeDefaultProp(
  text: Octopus['Text'],
  prop: keyof Octopus['TextStyle'],
  value: unknown
): Octopus['Text'] {
  const defaultStyle = isObject(text.defaultStyle) ? text.defaultStyle : {}
  const defaultsMissProp = !has(defaultStyle, prop)
  const defaultsHasDefault = defaultStyle?.[prop] === value
  const customDefaultsMissing = defaultsMissProp || defaultsHasDefault
  const customStylesMissing = asArray(text.styles).every((style) => {
    const rangeMissProp = !has(style?.style, prop)
    const rangeHasDefault = style?.style?.[prop] === value
    return rangeMissProp || rangeHasDefault
  })
  if (customDefaultsMissing && customStylesMissing) {
    const normalizedDefaultStyle = normalizeDefaultStyle(defaultStyle, prop, value)
    const normalizedStyles = normalizeStyles(text.styles as Octopus['StyleRange'][], prop)
    return {
      ...text,
      defaultStyle: normalizedDefaultStyle,
      styles: normalizedStyles,
    }
  }
  return text
}

export function normalizeDefaults(text: Octopus['Text']): Octopus['Text'] {
  const defaultValues = {
    letterSpacing: 0,
  }
  if (!Array.isArray(text.styles)) return text
  return keys(defaultValues).reduce((options, defaultValueProp) => {
    return normalizeDefaultProp(options, defaultValueProp, defaultValues[defaultValueProp])
  }, text)
}
