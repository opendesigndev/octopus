export type AdditionalTextDataTextFrame = Partial<{
  width: number
  height: number
}>
export type AdditionalTextDataText = Partial<{
  content: string
  index: number
  name: string
  frame: AdditionalTextDataTextFrame
}>

export type AdditionalTextData = {
  texts?: AdditionalTextDataText[]
}
