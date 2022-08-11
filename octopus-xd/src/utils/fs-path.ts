function normalizeArray(parts: string[], allowAboveRoot: boolean) {
  let up = 0
  for (let i = parts.length - 1; i >= 0; i--) {
    const last = parts[i]
    if (last === '.') {
      parts.splice(i, 1)
    } else if (last === '..') {
      parts.splice(i, 1)
      up++
    } else if (up) {
      parts.splice(i, 1)
      up--
    }
  }

  if (allowAboveRoot) for (; up--; up) parts.unshift('..')

  return parts
}

function resolve(...args: string[]) {
  let resolvedPath = ''
  let resolvedAbsolute = false

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : '/'

    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings')
    } else if (!path) {
      continue
    }

    resolvedPath = path + '/' + resolvedPath
    resolvedAbsolute = path.charAt(0) === '/'
  }

  resolvedPath = normalizeArray(
    resolvedPath.split('/').filter((p) => p),
    !resolvedAbsolute
  ).join('/')

  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.'
}

function trim(arr: string[]) {
  let start = 0
  for (; start < arr.length; start++) {
    if (arr[start] !== '') break
  }

  let end = arr.length - 1
  for (; end >= 0; end--) {
    if (arr[end] !== '') break
  }

  if (start > end) return []
  return arr.slice(start, end - start + 1)
}

export function pathRelative(from: string, to: string) {
  const fromParts = trim(resolve(from).slice(1).split('/'))
  const toParts = trim(resolve(to).slice(1).split('/'))

  const length = Math.min(fromParts.length, toParts.length)
  let samePartsLength = length
  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i
      break
    }
  }

  let outputParts = []
  for (let i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..')
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength))

  return outputParts.join('/')
}

export function pathBasename(name: string) {
  return String(name)
    .replace(/[/\\]$/, '')
    .replace(/^.+[/\\]/, '')
}
