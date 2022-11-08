import type { ParserOptions } from '../../parser'

type Parallels = {
  previews: number
  nodes: number
  figmaS3: number
  defaultValue: number
  avocodeS3: number
  upload: number
  renditions: number
}

export default class Config {
  private _tokenType: string
  private _designId: string
  private _token: string
  private _host: string
  private _targetIds: string[]
  private _pixelsLimit: number
  private _framePreviews: boolean
  private _verbose: boolean
  private _shouldFetchUsedComponents: boolean
  private _shouldRenderImagerefs: boolean
  private _shouldObtainLibraries: boolean
  private _shouldObtainStyles: boolean
  private _parallels: Parallels

  static DEFAULT_DOWNLOADER_RETRIES = 3
  static DEFAULT_FIGMA_TOKEN_HEADER = 'X-Figma-Token'
  static DEFAULT_API_HOST = 'api.figma.com'
  static DEFAULT_PIXELS_LIMIT = 1e7
  static DEFAULT_PREVIEWS_PARALLELS = 1
  static DEFAULT_NODES_PARALLELS = 1
  static DEFAULT_AVCD_S3_PARALLELS = 10
  static DEFAULT_FIGMA_S3_PARALLELS = 1
  static DEFAULT_UPLOAD_PARALLELS = 15
  static DEFAULT_PARALLEL_REQUESTS = 3
  static DEFAULT_PARALLEL_RENDITIONS = 3
  static DEFAULT_VERBOSE = true
  static DEFAULT_FIGMA_IDS_FETCH_USED_COMPONENTS = true
  static DEFAULT_FRAME_PREVIEWS = false
  static DEFAULT_RENDITIONS_NODES = 10

  constructor(rawOptions: ParserOptions) {
    // options
    this._tokenType = rawOptions.tokenType
    this._designId = rawOptions.designId
    this._token = rawOptions.token
    this._host = rawOptions.host
    this._pixelsLimit = rawOptions.pixelsLimit
    this._framePreviews = rawOptions.framePreviews
    this._targetIds = rawOptions.ids ?? []
    this._parallels = {
      previews: rawOptions.previewsParallels,
      nodes: rawOptions.nodesParallels,
      figmaS3: rawOptions.s3Parallels,
      avocodeS3: Config.DEFAULT_AVCD_S3_PARALLELS,
      defaultValue: rawOptions.parallelRequests,
      upload: Config.DEFAULT_UPLOAD_PARALLELS,
      renditions: Config.DEFAULT_PARALLEL_RENDITIONS,
    }
    this._verbose = rawOptions.verbose
    this._shouldRenderImagerefs = rawOptions.renderImagerefs
    this._shouldObtainLibraries = rawOptions.shouldObtainLibraries
    this._shouldObtainStyles = rawOptions.shouldObtainStyles
    this._shouldFetchUsedComponents = rawOptions.figmaIdsFetchUsedComponents
  }

  setIds(ids: string[]): void {
    if (!Array.isArray(ids)) return
    this._targetIds = ids
  }

  get isPersonalToken(): boolean {
    return this._tokenType === 'personal'
  }

  get isBase64Token(): boolean {
    return this._tokenType === 'base64'
  }

  get isOAuth2Token(): boolean {
    return this._tokenType === 'oauth2'
  }

  get designId(): string {
    return this._designId
  }

  get token(): string {
    return this._token
  }

  get host(): string {
    return this._host
  }

  get pixelsLimit(): number {
    return this._pixelsLimit
  }

  get framePreviews(): boolean {
    return this._framePreviews
  }

  get targetIds(): string[] {
    return this._targetIds
  }

  get parallels(): Parallels {
    return this._parallels
  }

  get isVerbose(): boolean {
    return this._verbose
  }

  get shouldRenderImagerefs(): boolean {
    return this._shouldRenderImagerefs
  }

  get shouldObtainLibraries(): boolean {
    return this._shouldObtainLibraries
  }

  get shouldObtainStyles(): boolean {
    return this._shouldObtainStyles
  }

  get shouldFetchUsedComponents(): boolean {
    return this._shouldFetchUsedComponents
  }

  get downloaderRetries(): number {
    return Config.DEFAULT_DOWNLOADER_RETRIES
  }

  get figmaTokenHeader(): string {
    return Config.DEFAULT_FIGMA_TOKEN_HEADER
  }

  get renditionNodes(): number {
    return Config.DEFAULT_RENDITIONS_NODES
  }
}
