import type { RawLayer } from '../../../typings/raw'
import type { ImageSize } from '../../general/image-size/image-size'

export type EventDesign = {
  event: 'ready:design'
  data: ResolvedDesign
}
export type EventFrame = {
  event: 'ready:artboard' | 'ready:component' | 'ready:library'
  data: ResolvedFrame
}
export type EventFill = {
  event: 'ready:fill'
  data: ResolvedFill
}
export type EventPreview = {
  event: 'ready:preview'
  data: ResolvedPreview
}

export type Event = EventDesign | EventFrame | EventFill | EventPreview

export type ResolvedContent = {
  artboards: ResolvedFrame[]
  components: ResolvedFrame[]
  libraries: ResolvedFrame[]
}

export type ResolvedDesign = {
  designId: string
  content?: Promise<{ artboards: ResolvedFrame[] }>
}

export type ResolvedFrame = {
  designId: string
  nodeId: string
  node: { document: RawLayer }
}

export type ResolvedFill = {
  designId: string
  ref: string
  buffer: Uint8Array
  size?: ImageSize | undefined
}

export type ResolvedPreview = {
  designId: string
  nodeId: string
  buffer: Uint8Array
}
