// import path from 'path'

// // import FSUtils from '../../utils/fs-utils'
// import { filenameId } from '../../utils/fs'

// import type { S3Cacher } from '../..'

// type PathLocatorOptions = {
//   s3Cacher: S3Cacher
// }

// export default class PathLocator {
//   _s3Cacher: S3Cacher

//   constructor({ s3Cacher }: PathLocatorOptions) {
//     this._s3Cacher = s3Cacher
//   }

//   get s3Cacher(): S3Cacher {
//     return this._s3Cacher
//   }

//   getCacheMapFilename(): string {
//     const { outputDir, cacheMapFile } = this._s3Cacher
//     return path.join(outputDir, cacheMapFile)
//   }

//   getManifestOctopusFilename(id: string): string {
//     const { artifactsDir } = this.s3Cacher
//     return path.join(artifactsDir, `octopus-${filenameId(id)}.json`)
//   }

//   async getOctopusFullPath(id: string) {
//     const { outputDir } = this.fp.config.fstruct
//     return path.join(outputDir, await this._versionDir, this.getManifestOctopusFilename(id))
//   }

//   getChunkFullPath(id: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `chunk-${filenameId(id)}.json`)
//   }

//   async getManifestChunkFilename(id: string) {
//     const { outputDir } = this.fp.config.fstruct
//     // return this.getChunkFullPath(id)
//     return path.relative(path.join(outputDir /*, await this._versionDir */), this.getChunkFullPath(id))
//   }

//   getFrameLikeFullPath(id: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `${filenameId(id)}.json`)
//   }

//   getLightStructFullPath() {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, 'light-struct.json')
//   }

//   getLibFullPath(id: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `ext-comp-${filenameId(id)}.json`)
//   }

//   async getManifestFrameLikeFilename(id: string) {
//     const { outputDir } = this.fp.config.fstruct
//     // return this.getFrameLikeFullPath(id)
//     return path.relative(path.join(outputDir /*, await this._versionDir */), this.getFrameLikeFullPath(id))
//   }

//   async getManifestFullPath() {
//     const { outputDir, octopusManifestFile } = this.fp.config.fstruct
//     // const readyFrameLikes = this.fp.processingState.frameLikes.length
//     return path.join(outputDir /*, await this._versionDir*/, octopusManifestFile)
//   }

//   async getDeprecatedManifestFullPath() {
//     const { outputDir, manifestFile } = this.fp.config.fstruct
//     return path.join(outputDir, await this._versionDir, manifestFile)
//   }

//   async getRequestsBenchmarksFile() {
//     const { outputDir, requestsBenchmarksFile } = this.fp.config.fstruct
//     return path.join(outputDir, await this._versionDir, requestsBenchmarksFile)
//   }

//   getLibDescriptorFullPath(componentKey: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `lib-descriptor-${componentKey}.json`)
//   }

//   getRenditionDescriptorFullPath(id: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `rendition-${filenameId(id)}.json`)
//   }

//   getPreviewDescriptorFullPath(id: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `preview-descriptor-${filenameId(id)}.json`)
//   }

//   getFillsDescriptorFullPath(id: string) {
//     const { outputDir, sourcesDir } = this.fp.config.fstruct
//     return path.join(outputDir, sourcesDir, `fill-descriptor-${filenameId(id)}.json`)
//   }

//   getRenditionFullPath(id: string) {
//     const { outputDir, bitmapsDir } = this.fp.config.fstruct
//     return path.join(outputDir, bitmapsDir, `rendition-${filenameId(id)}.png`)
//   }

//   getPreviewFullPath(id: string) {
//     const { outputDir, previewsDir } = this.fp.config.fstruct
//     return path.join(outputDir, previewsDir, `preview-${filenameId(id)}.png`)
//   }

//   async getManifestPreviewFilename(id: string) {
//     const { outputDir } = this.fp.config.fstruct
//     // return this.getPreviewFullPath(id)
//     return path.relative(path.join(outputDir /*, await this._versionDir */), this.getPreviewFullPath(id))
//   }

//   getFillFullPath(key: string) {
//     const { outputDir, bitmapsDir } = this.fp.config.fstruct
//     return path.join(outputDir, bitmapsDir, `${filenameId(key)}`)
//   }
// }
