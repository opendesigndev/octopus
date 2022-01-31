import { RawArtboardEntry } from "./artboard"

export type RawSourceRoot ={
    OCProperties?: RawSourceRootOcProperties| null
    Pages?: RawSourceRootPages
}

export type RawSourceRootOcProperties ={
    D: RawSourceRootOcPropertiesD
}

export type RawSourceRootOcPropertiesDObject = {
    ObjID?: number| null
}


export type RawSourceRootOcPropertiesD ={
    OFF?: RawSourceRootOcPropertiesDObject[]| null
    ON?: RawSourceRootOcPropertiesDObject[]| null
}

export type RawSourceRootPages = {
    Count?: number | null
    Kids?: RawArtboardEntry[]
}

export type RawSource = {
    Root?: RawSourceRoot | null,
    Pages?: RawSourceRootPages
}