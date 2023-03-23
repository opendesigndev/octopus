import { EndpointBase } from './endpoint-base'
import { buildEndpoint } from '../../utils/request'

import type { RequestsManager } from '.'

type LibraryEndpointOptions = {
  requestsManager: RequestsManager
}

export class LibraryEndpoint extends EndpointBase {
  static EP_PERSONAL = 'https://:host/v1/components/:componentId'
  static EP_BASE64 = 'https://:host/v1/components/:componentId?token=:token'

  constructor(options: LibraryEndpointOptions) {
    super(options)
  }

  prepareRequest(componentId: string): string {
    const { EP_PERSONAL, EP_BASE64 } = LibraryEndpoint
    const { isBase64Token, host, token } = this.config
    return isBase64Token
      ? buildEndpoint(EP_BASE64, { host, componentId })
      : buildEndpoint(EP_PERSONAL, { host, componentId, token })
  }
}
