import type { RawLayer } from '../../../typings/raw'

export type EventDesign = {
  event: 'ready:design'
  data: ResolvedDesign
}
export type EventFrame = {
  event: 'ready:artboard' | 'ready:component' | 'ready:library'
  data: ResolvedFrame
}

export type Event = EventDesign | EventFrame

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
