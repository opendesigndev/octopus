import type { RawLayer } from '.'

export type RawGroupLayer = {
  Type?: 'MarkedContext'
  Tag?: string
  Properties?: string
  Kids?: RawLayer[]
}
