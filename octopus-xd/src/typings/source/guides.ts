export type RawGuide = {
  position?: number
  guid?: string
}
export type RawGuides = {
  guides?: RawGuide[]
}
export type RawGuidesModel = {
  verticalGuides?: RawGuides
  horizontalGuides?: RawGuides
}
