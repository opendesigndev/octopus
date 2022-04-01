/**
 * Helper aliases.
 */

export type Semver = string
export type PageId = string
export type ArtboardId = string
export type ComponentId = string
export type LibraryId = string
export type ChunkId = string

export type TypedId<T> = {
  id: string
  type: T
}

/**
 * Types describing local or remote resource location.
 */
export type ResourceLocationLocal = {
  type: 'LOCAL_RESOURCE'
  path: string
}
export type ResourceLocationRemoteURL = {
  type: 'REMOTE_RESOURCE_URL'
  url: string
}
export type ResourceLocationTransient = {
  type: 'TRANSIENT'
}
export type ResourceLocationRemote = {
  type: 'REMOTE_RESOURCE'
  path: string
  versionHash: string
}
export type ResourceLocation =
  | ResourceLocationLocal
  | ResourceLocationRemoteURL
  | ResourceLocationRemote
  | ResourceLocationTransient

/**
 * Octopus Manifest origin - where design file comes from.
 */
export type OctopusManifestOrigin = {
  name: 'sketch' | 'xd' | 'photoshop' | 'illustrator' | 'figma'
  version: string
}

/**
 * General bounds types.
 */
export type Bounds = {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Assets.
 */
export type AssetFont = {
  location?: ResourceLocation
  fontType?: string // ttf, otf ...
  refId?: string
  name?: string
}
export type AssetImage = {
  location: ResourceLocation
  imageType?: string // png, jpg ...
  refId?: string
  name?: string
}
export type Assets = {
  fonts?: AssetFont[]
  images?: AssetImage[]
}

/**
 * Meta descriptor of component set. You can use it to distinguish what components come from
 * what set.
 */
export type ComponentSet = {
  id: string
  name: string
  description?: string
}

/**
 * Variant meta.
 */
export type VariantMeta = {
  of: ComponentSet
  properties: {
    [key: string]: string
  }
  description?: string
}

/**
 * Page descriptor. Can contain only artboards or component masters.
 */
export type Page = {
  id: PageId
  name: string
  children: TypedId<'ARTBOARD' | 'COMPONENT' | 'CHUNK'>[]
  description?: string
  hash?: string
}

/**
 * Component master descriptor.
 */
export type Component = {
  id: ComponentId
  name: string
  bounds: Bounds
  dependencies: TypedId<'COMPONENT' | 'CHUNK'>[]
  location: ResourceLocation
  /* isLibraryComponent: true ??? */
  preview?: ResourceLocation
  assets?: Assets
  variant?: VariantMeta
  description?: string
  hash?: string
}

/**
 * Artboard descriptor.
 */
export type Artboard = {
  id: ArtboardId
  name: string
  bounds: Bounds
  dependencies: TypedId<'COMPONENT' | 'CHUNK'>[]
  location: ResourceLocation
  preview?: ResourceLocation
  assets?: Assets
  isPasteboard?: boolean
  description?: string
  hash?: string
}

/**
 * Library descriptor (only a wrapper of components, not component itself). Similar to page.
 */
export type Library = {
  id: LibraryId /* ??? */
  name: string
  children: TypedId<'COMPONENT' | 'CHUNK'>[]
  location?: ResourceLocation /* ??? */
  preview?: ResourceLocation
  assets?: Assets /* ??? */
  description?: string
  hash?: string
}

/**
 * Chunk descriptor. Layer chunk (or "part" or "diff" or "patch", whatever)
 * is partial representation of layer. Could be used for description of:
 * - overrides
 * - layer styles
 * - design tokens
 */
export type Chunk = {
  id: ChunkId
  name: string
  type: 'OVERRIDE' | 'LAYER_STYLE' | 'TOKEN' | 'WHATEVER'
  location: ResourceLocation
  preview?: ResourceLocation
  assets?: Assets
  description?: string
  hash?: string
  /* origin? */
}

/**
 * OctopusManifest itself.
 */
export type OctopusManifestReport = {
  version: Semver
  origin: OctopusManifestOrigin
  name: string
  pages: Page[]
  components: Component[]
  artboards: Artboard[]
  libraries: Library[]
  chunks: Chunk[]
  resourcesBase?: string // resources prefix, like https://remote.xy/somewhere/ or /some/local/dir
  interactions?: ResourceLocation // prototyping / flow schema
  hash?: string
}
