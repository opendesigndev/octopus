import { RawLayer } from "./source-layer-common"


export type RawArtboardEntryContents = {
    Filter?:string|null,
    Length?: number|null,
    Kind?: number|null,
    Data?: RawLayer[]
}



export type RawArtboardEntry = {
    Contents?:RawArtboardEntryContents,
}