import type { PrivateData } from '@opendesign/illustrator-parser-pdfcpu/dist/index'

type PromiseAdditionalTextData = ReturnType<typeof PrivateData>
type Awaited<T> = T extends PromiseLike<infer U> ? U : T

export type AdditionalTextData = Awaited<Awaited<PromiseAdditionalTextData>>
export type AdditionalTextDataText = Required<AdditionalTextData>['TextLayers'][0]
