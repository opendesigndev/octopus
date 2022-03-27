import isEqual from 'lodash/isEqual'
import { asArray } from '../utils/as'

import type { Octopus } from '../typings/octopus-common'

function normalizeRanges(ranges: Octopus['StyleRange']['ranges']): Octopus['StyleRange']['ranges'] {
  const sorted = ranges.slice().sort((a, b) => a.from - b.from)
  return sorted.reduce((merged, curr, index) => {
    if (!index) {
      merged.push({ ...curr })
      return merged
    }
    const prev = merged[merged.length - 1]
    const overlap = prev.to >= curr.from
    if (overlap) {
      prev.to = Math.max(curr.to, prev.to)
    } else {
      merged.push({ ...curr })
    }
    return merged
  }, [] as Octopus['StyleRange']['ranges'])
}

export function normalizeDupRanges(text: Octopus['Text']): Octopus['Text'] {
  const uniques = asArray(text.styles).reduce((map, style) => {
    const savedStyle = [...map.keys()].find((unique) => isEqual(unique, style.style))
    if (savedStyle) {
      map.get(savedStyle).push(...style.ranges)
    } else {
      map.set(style.style, style.ranges)
    }
    return map
  }, new Map())

  const mergedRanges = [...uniques.keys()].reduce((merged, unique) => {
    return [
      ...merged,
      {
        style: unique,
        ranges: normalizeRanges(uniques.get(unique)),
      },
    ]
  }, [])

  return {
    ...text,
    ...(mergedRanges.length ? { styles: mergedRanges } : null),
  }
}
