import chunk from 'lodash/chunk'

import { isObject, keys } from '../../utils/common'
import { buildEndpoint } from '../../utils/request'
import { EndpointBase } from './endpoint-base'

import type { RequestsManager } from '.'
import type { FigmaNode, FigmaNodesResponse } from '../../types/figma'

type NodesOptions = {
  requestsManager: RequestsManager
}

export type DesignNodes = { designId: string; nodeIds: string[] }

export type NodeAddress = {
  nodeId: string
  designId: string
}

export class NodesEndpoint extends EndpointBase {
  static EP_PERSONAL = 'https://:host/v1/files/:designId/nodes/?ids=:ids&geometry=paths'
  static EP_BASE64 = 'https://:host/v1/files/:designId/nodes/?ids=:ids&token=:token&geometry=paths'

  constructor(options: NodesOptions) {
    super(options)
  }

  prepareRequest(designId: string, ids: string[]): string {
    const { EP_PERSONAL, EP_BASE64 } = NodesEndpoint
    const { isBase64Token, host, token } = this.config
    return isBase64Token
      ? buildEndpoint(EP_BASE64, { host, designId, ids, token })
      : buildEndpoint(EP_PERSONAL, { host, designId, ids })
  }

  groupRequests(ids: NodeAddress[]): DesignNodes[] {
    const map = ids.reduce<{ [key: string]: string[] }>((map, { designId, nodeId }) => {
      if (!map[designId]) map[designId] = []
      map[designId].push(nodeId)
      return map
    }, {})

    return keys(map).reduce<DesignNodes[]>((grouped, designId) => {
      const designNodes = chunk(map[designId], this.config.parallels.nodes).map((nodeIds: string[]) => {
        return { designId, nodeIds }
      })
      grouped.push(...designNodes)
      return grouped
    }, [])
  }

  ungroupResponses(responses: FigmaNodesResponse[], groups: DesignNodes[], ids: NodeAddress[]): FigmaNode[] {
    const map = responses.reduce((map, resp, index) => {
      const { designId } = groups[index]
      // const documentBase = without(resp, ['nodes'] as const)
      const nodeIds = isObject(resp?.nodes) ? keys(resp.nodes) : []
      const subMap = Object.fromEntries(
        nodeIds.map((nodeId) => {
          // const result = {
          //   ...Object(documentBase),
          //   nodes: { [nodeId]: resp?.nodes?.[nodeId] },
          // }
          return [nodeId, resp?.nodes?.[nodeId]]
        })
      ) as Record<typeof nodeIds[number], FigmaNode>
      map[designId] = {
        ...(map[designId] ?? {}),
        ...subMap,
      }
      return map
    }, {} as Record<string, Record<string, FigmaNode>>)

    return ids.map(({ nodeId, designId }) => map[designId][nodeId])
  }
}
