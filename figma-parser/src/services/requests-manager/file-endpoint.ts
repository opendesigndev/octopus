import { buildEndpoint } from '../../utils/request.js'
import { EndpointBase } from './endpoint-base.js'

import type { RequestsManager } from './index.js'

type FileEndpointOptions = {
  requestsManager: RequestsManager
}

export class FileEndpoint extends EndpointBase {
  static EP_PERSONAL = 'https://:host/v1/files/:designId'
  static EP_BASE64 = 'https://:host/v1/file/?token=:token'

  constructor(options: FileEndpointOptions) {
    super(options)
  }

  prepareRequest(designId: string): string {
    const { EP_PERSONAL, EP_BASE64 } = FileEndpoint
    const { isBase64Token, host, token } = this.config
    return isBase64Token ? buildEndpoint(EP_BASE64, { host, token }) : buildEndpoint(EP_PERSONAL, { host, designId })
  }
}
