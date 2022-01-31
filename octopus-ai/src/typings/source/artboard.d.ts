import { SourceLayer } from "../../factories/create-source-layer"



export type RawArtboardEntryContentsMarkedContext = {
    Type?: "MarkedContext" | null,
    Kids: SourceLayer []

}
export type RawArtboardEntryContents = {
    Filter?:string|null,
    Length?: number|null,
    Kind?: number|null,
    Data?: [RawArtboardEntryContentsMarkedContext]
}



export type RawArtboardEntry = {
    Contents?:RawArtboardEntryContents,
}