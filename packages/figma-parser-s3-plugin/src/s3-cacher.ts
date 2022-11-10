import get from 'lodash/get'
import set from 'lodash/set'

import type { S3Plugin } from '.'
import type { ICacher } from './types/cacher'
import type { FigmaFile, FigmaNode } from './types/figma'

export type S3CacherOptions = {
  s3Plugin: S3Plugin
}

type CachedMeta<T> = {
  cached: T[]
  noncached: T[]
}

type NodeAddress = {
  nodeId: string
  designId: string
}

type CacheMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  state: 'COMPLETE' | 'PROCESSING'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cache = { [key: string]: any }

export class S3Cacher implements ICacher {
  _s3Plugin: S3Plugin
  _cache: Cache
  _cacheMap: Promise<CacheMap>
  _originalState: 'COMPLETE' | 'PROCESSING'
  _syncer: NodeJS.Timeout
  _latestSync: Promise<unknown>
  _uploads: Promise<unknown>[]

  constructor(options: S3CacherOptions) {
    this._s3Plugin = options.s3Plugin
    this._cache = {}
    this._cacheMap = this._initCacheMap()
    this._latestSync = Promise.resolve()
    this._uploads = []
    this._syncer = setInterval(() => {
      this._latestSync = this._latestSync.then(() => {
        return this._cacheMap.then((cacheMap) => {
          return cacheMap.state === 'COMPLETE' ? Promise.resolve() : this._sync()
        })
      })
    }, 3000)
  }

  originalState(): 'COMPLETE' | 'PROCESSING' {
    return this._originalState === 'COMPLETE' ? 'COMPLETE' : 'PROCESSING'
  }

  private _sync(isLast = false): Promise<unknown> {
    return Promise.all([this._s3Plugin._pathLocator.getCacheMap(), this.cacheMap]).then(([key, body]) => {
      this._s3Plugin._logger.info(isLast ? 'Finalizing cache map sync' : 'Syncing cache map')
      return this._s3Plugin._s3.upload({ key, body: JSON.stringify(body) })
    })
  }

  async _initCacheMap(): Promise<CacheMap> {
    const location = await this._s3Plugin._pathLocator.getCacheMap()
    try {
      const reqMap = Object(JSON.parse((await this._s3Plugin._s3.download({ key: location })).toString()))
      this._originalState = reqMap.state
      return reqMap
    } catch (err) {
      return Promise.resolve({ state: 'PROCESSING' })
    }
  }

  get cacheMap(): Promise<CacheMap> {
    return this._cacheMap
  }

  get state(): Promise<'COMPLETE' | 'PROCESSING'> {
    return this.cacheMap.then((cache) => {
      return cache.state
    })
  }

  async finalize(): Promise<unknown> {
    const cacheMap = await this.cacheMap
    cacheMap.state = 'COMPLETE'
    clearInterval(this._syncer)
    await Promise.all(this._uploads)
    return this._sync()
  }

  private async _has(cacheMapKey: string): Promise<boolean> {
    return Boolean(get(await this.cacheMap, cacheMapKey))
  }

  private async _set(cacheMapKey: string, path: string, body: string | Buffer): Promise<void> {
    if (this._cache[path]) return
    this._cache[path] = Promise.resolve(body)
    const upload = this._s3Plugin._s3.upload({ key: path, body })
    this._uploads.push(upload)
    await upload
    const cacheMap = await this.cacheMap
    set(cacheMap, cacheMapKey, path)
  }

  private async _get(cacheMapKey: string): Promise<unknown | null> {
    const cacheMap = await this.cacheMap
    const path = get(cacheMap, cacheMapKey) as string
    if (!path) return null
    if (!this._cache[path]) {
      this._cache[path] = this._s3Plugin._s3.download({ key: path })
    }
    return (this._cache[path] as Promise<unknown>).catch((): null => {
      set(cacheMap, cacheMapKey, undefined)
      return null
    })
  }

  /**
   * Designs.
   */
  private _getDesignCacheKey(designId: string): string {
    return `designs.${designId}`
  }

  async designs(designIds: string[]): Promise<CachedMeta<string>> {
    const cacheMap = await this.cacheMap
    return designIds.reduce<CachedMeta<string>>(
      (cachedMeta, designId) => {
        if (get(cacheMap, this._getDesignCacheKey(designId))) {
          cachedMeta.cached.push(designId)
        } else {
          cachedMeta.noncached.push(designId)
        }
        return cachedMeta
      },
      { cached: [], noncached: [] }
    )
  }

  async resolveDesign(designId: string): Promise<FigmaFile> {
    const design = await this._get(this._getDesignCacheKey(designId))
    return JSON.parse(design as string)
  }

  cacheDesigns(designs: [string, Record<PropertyKey, unknown>][]): void {
    designs.forEach(async (design) => {
      const [designId, designBody] = design
      this._set(
        this._getDesignCacheKey(designId),
        await this._s3Plugin._pathLocator.getDesign(designId),
        JSON.stringify(designBody)
      )
    })
  }

  /**
   * Nodes.
   */

  private _getFrameLikeCacheKey(designId: string, nodeId: string): string {
    return `frameLikes.${designId}.${nodeId}`
  }

  async nodes(ids: NodeAddress[]): Promise<CachedMeta<NodeAddress>> {
    const cacheMap = await this.cacheMap
    return ids.reduce<CachedMeta<NodeAddress>>(
      (cachedMeta, nodeAddress) => {
        if (get(cacheMap, this._getFrameLikeCacheKey(nodeAddress.designId, nodeAddress.nodeId))) {
          cachedMeta.cached.push(nodeAddress)
        } else {
          cachedMeta.noncached.push(nodeAddress)
        }
        return cachedMeta
      },
      { cached: [], noncached: [] }
    )
  }

  async resolveNode(id: NodeAddress): Promise<FigmaNode> {
    const node = await this._get(this._getFrameLikeCacheKey(id.designId, id.nodeId))
    return JSON.parse(node as string)
  }

  cacheNodes(nodes: [NodeAddress, Record<PropertyKey, unknown>][]): void {
    nodes.forEach(async (node) => {
      const [id, nodeBody] = node
      this._set(
        this._getFrameLikeCacheKey(id.designId, id.nodeId),
        await this._s3Plugin._pathLocator.getFrameLike(id.designId, id.nodeId),
        JSON.stringify(nodeBody)
      )
    })
  }

  /**
   * Libraries.
   */

  private _getLibCacheKey(componentId: string): string {
    return `libraries.${componentId}`
  }

  async resolveComponent(
    componentId: string
  ): Promise<NodeAddress & { name: string; description: string } & { component: FigmaNode }> {
    const component = await this._get(this._getLibCacheKey(componentId))
    return JSON.parse(component as string)
  }

  cacheComponents(components: [string, NodeAddress & { component: Record<PropertyKey, unknown> }][]): void {
    components.forEach(async (component) => {
      const [id, componentDescriptor] = component
      this._set(
        this._getLibCacheKey(id),
        await this._s3Plugin._pathLocator.getLibrary(id),
        JSON.stringify(componentDescriptor)
      )
    })
  }

  /**
   * Fills.
   */

  private _getFillCacheKey(designId: string, refId: string): string {
    return `fills.${designId}.${refId}`
  }

  async fills(fills: { designId: string; ref: string }[]): Promise<CachedMeta<{ designId: string; ref: string }>> {
    const cacheMap = await this.cacheMap
    return fills.reduce<CachedMeta<{ designId: string; ref: string }>>(
      (cachedMeta, fill) => {
        if (get(cacheMap, this._getFillCacheKey(fill.designId, fill.ref))) {
          cachedMeta.cached.push(fill)
        } else {
          cachedMeta.noncached.push(fill)
        }
        return cachedMeta
      },
      { cached: [], noncached: [] }
    )
  }

  async resolveFill(designId: string, ref: string): Promise<ArrayBuffer> {
    return this._get(this._getFillCacheKey(designId, ref)) as Promise<ArrayBuffer>
  }

  cacheFills(fills: [string, string, ArrayBuffer][]): void {
    fills.forEach(async (fill) => {
      const [designId, ref, image] = fill
      this._set(
        this._getFillCacheKey(designId, ref),
        await this._s3Plugin._pathLocator.getFill(designId, ref),
        Buffer.from(image)
      )
    })
  }

  /**
   * Previews.
   */

  private _getPreviewCacheKey(designId: string, nodeId: string): string {
    return `previews.${designId}.${nodeId}`
  }

  resolvePreview(id: NodeAddress): Promise<ArrayBuffer> {
    return this._get(this._getPreviewCacheKey(id.designId, id.nodeId)) as Promise<ArrayBuffer>
  }

  cachePreviews(previews: [NodeAddress, ArrayBuffer][]): void {
    previews.forEach(async (preview) => {
      const [id, image] = preview
      this._set(
        this._getPreviewCacheKey(id.designId, id.nodeId),
        await this._s3Plugin._pathLocator.getPreview(id.designId, id.nodeId),
        Buffer.from(image)
      )
    })
  }

  /**
   * Styles.
   */
}
