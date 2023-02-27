import type { RawLayer } from './index.js'

export type RawGroupLayer = {
  Type?: 'MarkedContext'
  Tag?: string
  Properties?: string
  Kids?: RawLayer[]
}
