export type SourceRoot ={
    OCProperties?: SourceRootOcProperties| null
}

export type SourceRootOcProperties ={
    D: SourceRootOcPropertiesD
}

export type SourceRootOcPropertiesDObject = {
    ObjID?: number| null
}


export type SourceRootOcPropertiesD ={
    OFF?: SourceRootOcPropertiesDObject[]| null
    ON?: SourceRootOcPropertiesDObject[]| null
}

export type SourcePages = {
    Count?: number | null
    Kids?: RawArtBoard[]
}

export type Source = {
    Root?: SourceRoot | null,
    Pages?: 
}