export type AdditionalTextDataTextFrame = Partial<{
  width: number
  height: number
}>

export type AdditionalTextDataText = {
  content: string
  index: number
  name?: string
  frame?: AdditionalTextDataTextFrame
}

export type AdditionalTextData = {
  TextLayers?: AdditionalTextDataText[]
  LayerNames: string[]
}
