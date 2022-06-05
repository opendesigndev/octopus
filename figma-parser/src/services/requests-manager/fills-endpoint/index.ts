import { buildEndpoint } from '../../../utils/request'
import { EndpointBase } from '../endpoint-base'

import type { RequestsManager } from '..'

type FillsEndpointOptions = {
  requestsManager: RequestsManager
}

export class FillsEndpoint extends EndpointBase {
  static EP_PERSONAL = 'https://:host/v1/files/:designId/images/'
  static EP_BASE64 = 'https://:host/v1/files/:designId/images/?token=:token'

  constructor(options: FillsEndpointOptions) {
    super(options)
  }

  prepareRequest(designId: string): string {
    const { EP_PERSONAL, EP_BASE64 } = FillsEndpoint
    const { isBase64Token, host, token } = this.config
    return isBase64Token
      ? buildEndpoint(EP_BASE64, { host, designId, token })
      : buildEndpoint(EP_PERSONAL, { host, designId })
  }
}

// async _getFillsJSONWithPersonalToken(designIds: string[], onReady: Function) {
//   const ep = RequestsManager.ENDPOINTS.PERSONAL.FILLS
//   const targets = designIds.map(designId => {
//     return {
//       url: RequestsManager.buildEndpoint(ep, {
//         host: this.fp.config.host,
//         designId
//       }),
//       designId
//     }
//   })
//   return this._getFillsJSONTarget(targets, onReady)
// }

// async _getFillsJSONWithBase64Token(designIds: string[], onReady: Function) {
//   const ep = RequestsManager.ENDPOINTS.BASE64.FILLS
//   const targets = designIds.map(designId => {
//     return {
//       url: RequestsManager.buildEndpoint(ep, {
//         token: this.fp.config.token,
//         host: this.fp.config.host,
//         designId
//       }),
//       designId
//     }
//   })
//   return this._getFillsJSONTarget(targets, onReady)
// }
