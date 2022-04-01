import { RawLayer } from './layer'

export type RawGroupLayer = {
  Type?: 'MarkedContext'
  Tag?: string
  Properties?: string
  Kids?: RawLayer[]
}
