// import FigmaDesignLightStructure from './figma-entities/figma-design-light-structure'
// import FigmaNode from './figma-entities/figma-node'
// import FigmaParser from '.'
// // import { OctopusManifestReport } from './services/octopus-manifest/octopus-manifest-types'
// import { LibDescriptorMeta } from './utils/libraries-utils'

// export type FigmaLayer = {
//   renditionRef: string
// }

// export type TargetIds = {
//   topLevelArtboards: string[],
//   localComponents: string[],
//   remoteComponents: string[]
// }

// export type Style = {
//   id: string,
//   type: string,
//   source: {}
// }

// export type StyleMeta = {
//   styleSource: {}
//   localStylesEntry: {},
//   id: string,
//   name: string,
//   type: string,
//   filename: string
// }

// export type GenericMap = {[key: string]: string}

// export type ManifestMeta = {
//   targetIds: TargetIds,
//   structure: FigmaDesignLightStructure,
//   previews: GenericMap,
//   frameLikes: GenericMap,
//   sourceNodes: FigmaNode[],
//   libraries: GenericMap,
//   stylesMeta: StyleMeta[],
//   librariesSourceNodes: FigmaNode[]
// }

type S3ServiceDownloadOptions = {
  key: string
}

type S3ServiceUploadOptions = {
  key: string
  body: string | Buffer
}

export type S3Service = {
  raw: Record<PropertyKey, unknown>
  download: (options: S3ServiceDownloadOptions) => Promise<Buffer>
  upload: (options: S3ServiceUploadOptions) => Promise<unknown>
  options: {
    accessKeyId: string
    secretAccessKey: string
    region: string
  }
}

// export type Library = {
//   localMeta: {},
//   remoteMeta: {},
//   sourceNode: FigmaNode
// }

// export type SaveManifestOptions = {
//   structure: FigmaDesignLightStructure,
//   previews: {},
//   frameLikes: {},
//   sourceNodes: FigmaNode[],
//   libraries: {},
//   targetIds: TargetIds
// }

// export type SaveFrameLikeTargetsOptions = {
//   sourceNodes: FigmaNode[],
//   structure: FigmaDesignLightStructure
// }

// export type OctopusManifestOptions = {
//   // structure: FigmaDesignLightStructure,
//   // previews: {},
//   // frameLikes: {},
//   // sourceNodes: FigmaNode[],
//   // libraries: {},
//   // librariesSourceNodes: FigmaNode[],
//   // stylesMeta: StyleMeta[],
//   // targetIds: TargetIds,
//   figmaParser: FigmaParser
// }

// export type LibMetaEntry = {
//   remoteMeta: {
//     key: string,
//     file_key: string,
//     sourceName: string,
//     description: string,
//     node_id: string
//   },
//   localMeta: {
//     key: string,
//     name: string,
//     localId: string
//   },
//   filename: string
// }

// export type ManifestMetaArtboard = {
//   id: string,
//   name: string,
//   symbolID: string,
//   filename: string,
//   previewFilename: string,
//   componentSetId: string,
//   componentSetName: string,
//   variantProperties: { [key: string]: string }
// }

// export type ManifestMetaPage = {
//   id: string,
//   name: string,
//   artboards: ManifestMetaArtboard[]
// }

// export type SourceGroupIds = { designId: string, nodeIds: string[] }

// export type SourceId = { designId: string, nodeId: string }

// export type FigmaNodeDescriptor = { designId: string, nodeId: string, node: FigmaNode }

// export type LibDescriptor = {
//   key: string,
//   remoteMeta: LibDescriptorMeta
// }

// export type RenditionDescriptor = {
//   id: string,
//   url: string
// }

// export type PreviewDescriptor = {
//   id: string,
//   url: string
// }

// export type FillsMeta = FillDescriptor[]

// export type FillsMetaDescriptor = {
//   designId: string,
//   fillsMeta: FillsMeta
// }

// export type FillDescriptor = {
//   url: string,
//   ref: string
// }

// export type FullFillDescriptor = {
//   url: string,
//   ref: string,
//   designId: string
// }
