// import { createParser } from '../src/index-web'

// export const run = (): void => {
//   const parser = createParser({
//     designId: '9lJg7hAgjsDgrpueS30dMg',
//     token: '117960-0bf13919-ba73-427d-800a-07c02b5f71a3',
//     ids: [],
//     host: 'api.figma.com',
//     pixelsLimit: 1e7,
//     framePreviews: true,
//     previewsParallels: 3,
//     // framePreviews: boolean
//     tokenType: 'personal',
//     // previewsParallels: number
//     nodesParallels: 50,
//     s3Parallels: 30,
//     verbose: true,
//     figmaIdsFetchUsedComponents: true,
//     renderImagerefs: true,
//     shouldObtainLibraries: true,
//     shouldObtainStyles: true,
//     parallelRequests: 10,
//   })

//   const design = parser.parse()
//   design.on('ready:frame-like', (...args) => {
//     console.log('ready:frame-like', args)
//   })
// }
