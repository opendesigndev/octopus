export type AdditionalTextDataTextFrame = Partial<{
  width: number
  height: number
}>

export type AdditionalTextDataTextLayer = {
  content: string
  index: number
  name: string
  frame?: AdditionalTextDataTextFrame
}

export type AdditionalTextData = {
  TextLayers: AdditionalTextDataTextLayer[]
  LayerNames: string[]
}
