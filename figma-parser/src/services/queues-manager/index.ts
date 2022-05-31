import { Queue } from '../../utils/queue'

import type { Parser } from '../../parser'
import type { FigmaNode, FigmaNodesResponse } from '../../types/figma'
import type { JSONValue } from '../downloader/response.iface'
import type { NodeAddress } from '../requests-manager/nodes-endpoint'

type QueuesManagerOptions = {
  parser: Parser
}

type PartialSyncQueue = Queue<NodeAddress, FigmaNode>
type NodesMergerQueue = Queue<NodeAddress, FigmaNode>
type NodeRequestsQueue = Queue<string, JSONValue>

type Queues = {
  nodesMerger: NodesMergerQueue
  nodeRequests: NodeRequestsQueue
  partialSync: PartialSyncQueue
}

export class QueuesManager {
  private _parser: Parser
  private _queues: Queues

  constructor(options: QueuesManagerOptions) {
    this._parser = options.parser
    this._queues = {
      nodeRequests: this._initNodeRequestsQueue(options),
      nodesMerger: this._initNodesMergerQueue(),
      partialSync: this._initPartialSyncQueue(),
    }
  }

  private _initNodeRequestsQueue(options: QueuesManagerOptions): NodeRequestsQueue {
    return new Queue({
      name: 'Nodes Grouped Requests',
      parallels: options.parser.config.parallels.defaultValue,
      factory: async (requests: string[]) => {
        const [url] = requests
        const response = await this._parser.downloader.getJSON(url)
        return [{ value: response, error: null }]
      },
    })
  }

  /**
   * Reassemble tasks for `Nodes Grouped Requests` queue like: ID[] -> REQUEST[].
   * Only has 1 parallel to collect as many tasks as possible for drainer.
   * Drainer takes them all and reassembles.
   */
  private _initNodesMergerQueue(): NodesMergerQueue {
    return new Queue({
      name: 'Nodes Merger',
      parallels: 1,
      factory: async (ids: NodeAddress[]) => {
        const nodesEndpoint = this._parser.rm.nodes
        const groups = nodesEndpoint.groupRequests(ids)
        const tasks = groups.map((group) => {
          return nodesEndpoint.prepareRequest(group.designId, group.nodeIds)
        })
        const responses = (await Promise.all(this._queues.nodeRequests.execMany(tasks))) as FigmaNodesResponse[]
        const nodes = nodesEndpoint.ungroupResponses(responses, groups, ids)
        return nodes.map((node) => Queue.safeValue(node))
      },
      drainLimit: null,
    })
  }

  /**
   * Partial sync queue.
   *
   * Has 1 parallel per time, which means we have sequential sync phases.
   * Collects tasks and operate `drainLimit` per time.
   */
  private _initPartialSyncQueue(): PartialSyncQueue {
    return new Queue({
      name: 'Partial Sync Emitter',
      parallels: 1,
      factory: async (ids: NodeAddress[]) => {
        const results = await Promise.all(this._queues.nodesMerger.execMany(ids))
        return results.map((result) => Queue.safeValue(result))
      },
      drainLimit: 30 /** @TODO move to options */,
    })
  }

  get queues(): Queues {
    return this._queues
  }
}
