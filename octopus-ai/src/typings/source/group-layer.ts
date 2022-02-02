import { RawTextLayer } from "."

export type RawGroupLayer = {
    Type?: "MarkedContext",
    Tag?: string,
    Properties? : string,
    Kids?: RawTextLayer[],
}