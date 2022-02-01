import { RawTextLayer } from "."

export type RawGroupLayer = {
    Type?: "MarkedContext" | null,
    Tag?: string|null,
    Properties? : string|null,
    Kids?: RawTextLayer[]|null,
}