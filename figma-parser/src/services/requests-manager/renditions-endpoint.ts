import chunk from 'lodash/chunk'

import { buildEndpoint } from '../../utils/request'
import { EndpointBase } from './endpoint-base'

import type { RequestsManager } from '.'
import type { FigmaRenditionsResponse } from '../../types/figma'

export type RenditionRequestOptions = {
  headers: Record<string, string>
  json: unknown
}

type RenditionsEndpointOptions = {
  requestsManager: RequestsManager
}

export class RenditionsEndpoint extends EndpointBase {
  static EP = 'https://:host/v1/images/'

  constructor(options: RenditionsEndpointOptions) {
    super(options)
  }

  prepareRequest(ids: string[]): { url: string; options: RenditionRequestOptions } {
    const { EP } = RenditionsEndpoint
    const { isBase64Token, host, token } = this.config
    const bodyToken = isBase64Token ? { token } : {}
    const defaultMutation = {
      mutation_type: 'set_relative_transform',
      value: [
        [1, 0, 0],
        [0, 1, 0],
      ],
    }
    const postData = {
      ...bodyToken,
      requests: ids.map((id) => ({
        node_id: id,
        mutations: [{ node_id: id, ...defaultMutation }],
      })),
    }
    const target = buildEndpoint(EP, { host })
    return {
      url: target,
      options: {
        headers: {
          'X-Figma-Token': this.rm.parser.config.token,
          'User-Agent': 'Avocode',
        },
        json: postData,
      },
    }
  }

  groupRequests(nodes: string[]): string[][] {
    return chunk(nodes, this.config.renditionNodes)
  }

  ungroupResponses(responses: FigmaRenditionsResponse[]): Record<string, string> {
    return responses.reduce((map, response) => {
      const subMap = Object.fromEntries(
        response?.images.map((image) => {
          return [image.node_id, image.image]
        })
      )
      return {
        ...subMap,
        ...map,
      }
    }, {} as Record<string, string>)
  }
}
