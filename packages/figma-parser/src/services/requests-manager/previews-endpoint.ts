import chunk from 'lodash/chunk'

import { EndpointBase } from './endpoint-base'
import { isObject, keys } from '../../utils/common'
import { buildEndpoint } from '../../utils/request'

import type { RequestsManager } from '.'
import type { DesignNodes } from './nodes-endpoint'
import type { Node } from '../../entities/structural/node'
import type { FigmaPreviewsResponse } from '../../types/figma'

type PreviewsEndpointOptions = {
  requestsManager: RequestsManager
}

export class PreviewsEndpoint extends EndpointBase {
  static EP_PERSONAL = 'https://:host/v1/images/:designId?ids=:slicedIds'
  static EP_BASE64 = 'https://:host/v1/images/?token=:token&ids=:slicedIds'

  constructor(options: PreviewsEndpointOptions) {
    super(options)
  }

  private _splitPreviewTargetIds(sourceNodes: Node[]): string[][] {
    const groups = sourceNodes.reduce<Node[][]>((groups, sourceNode) => {
      const latest = groups[groups.length - 1] || []
      const latestPx = latest.reduce((sum, current) => {
        return sum + current.getPixelsArea()
      }, 0)

      return sourceNode.getPixelsArea() + latestPx > this.config.pixelsLimit
        ? [...groups, [sourceNode]]
        : [...groups.slice(0, -1), [...latest, sourceNode]]
    }, [])

    return groups.reduce<string[][]>((grouped, group) => {
      const groupIds: string[] = group.map((sourceNode: Node) => sourceNode.id)
      return [...grouped, ...chunk(groupIds, 300)]
    }, [])
  }

  prepareRequest(designId: string, ids: string[]): string {
    const { EP_PERSONAL, EP_BASE64 } = PreviewsEndpoint
    const { isBase64Token, host, token } = this.config
    return isBase64Token
      ? buildEndpoint(EP_BASE64, { host, designId, slicedIds: ids, token })
      : buildEndpoint(EP_PERSONAL, { host, designId, slicedIds: ids })
  }

  groupRequests(nodes: Node[]): DesignNodes[] {
    const map = nodes.reduce<{ [key: string]: Node[] }>((map, node) => {
      if (!map[node.designId]) map[node.designId] = []
      map[node.designId].push(node)
      return map
    }, {})

    return keys(map).reduce<DesignNodes[]>((grouped, designId) => {
      const pixelLimited = this._splitPreviewTargetIds(map[designId])
      const designNodes = pixelLimited.map((nodeIds: string[]) => {
        return { designId, nodeIds }
      })
      grouped.push(...designNodes)
      return grouped
    }, [])
  }

  ungroupResponses(responses: FigmaPreviewsResponse[], groups: DesignNodes[], nodes: Node[]): string[] {
    const map = responses.reduce((map, resp, index) => {
      const { designId } = groups[index]
      const nodeIds = isObject(resp?.images) ? keys(resp.images) : []
      const subMap = Object.fromEntries(
        nodeIds.map((nodeId) => {
          return [nodeId, resp?.images?.[nodeId]]
        })
      ) as Record<typeof nodeIds[number], string>

      map[designId] = {
        ...(map[designId] ?? {}),
        ...subMap,
      }

      return map
    }, {} as Record<string, Record<string, string>>)

    return nodes.map(({ nodeId, designId }) => map[designId][nodeId])
  }
}
