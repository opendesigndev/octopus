// import { logger } from '..'
import { Queue } from '../../utils/queue'

import type { Node } from '../../entities/structural/node'
import type { Parser } from '../../parser'
import type {
  FigmaComponent,
  FigmaNode,
  FigmaNodesResponse,
  FigmaPreviewsResponse,
  FigmaRenditionsResponse,
} from '../../types/figma'
import type { JSONValue } from '../downloader/response.iface'
import type { NodeAddress } from '../requests-manager/nodes-endpoint'
import type { RenditionRequestOptions } from '../requests-manager/renditions-endpoint'
import type { KyInstance } from 'ky/distribution/types/ky'

type QueuesManagerOptions = {
  parser: Parser
}

type PartialSyncQueue = Queue<NodeAddress, FigmaNode>
type NodesMergerQueue = Queue<NodeAddress, FigmaNode>
type NodeRequestsQueue = Queue<string, JSONValue>
type FillsQueue = Queue<string, JSONValue>
type FigmaS3Queue = Queue<string, ArrayBuffer>
type PreviewsDescriptorsQueue = Queue<string, JSONValue>
type PreviewsQueue = Queue<Node, ArrayBuffer>
type RenditionsDescriptorsQueue = Queue<{ url: string; options: RenditionRequestOptions }, JSONValue>
type RenditionsQueue = Queue<string, ArrayBuffer>
type LibrariesQueue = Queue<string, null | (NodeAddress & { component: FigmaNode })>

type Queues = {
  nodesMerger: NodesMergerQueue
  nodeRequests: NodeRequestsQueue
  partialSync: PartialSyncQueue
  fills: FillsQueue
  figmaS3: FigmaS3Queue
  previewsDescriptors: PreviewsDescriptorsQueue
  previews: PreviewsQueue
  renditionsDescriptors: RenditionsDescriptorsQueue
  renditions: RenditionsQueue
  libraries: LibrariesQueue
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
      fills: this._initFillsQueue(options),
      figmaS3: this._initFigmaS3Queue(options),
      previewsDescriptors: this._initPreviewsDescriptorsQueue(options),
      previews: this._initPreviewsQueue(),
      renditionsDescriptors: this._initRenditionsDescriptorsQueue(options),
      renditions: this._initRenditionsQueue(),
      libraries: this._initLibrariesQueue(),
    }

    // if (options.parser.config.isVerbose) {
    //   setInterval(() => {
    //     logger?.info(
    //       'Queues status',
    //       Object.values(this._queues).map(
    //         (queue) =>
    //           `enq ${queue.status.enqueued} av ${queue.status.available} wo ${queue.status.working} name ${queue.status.name} `
    //       )
    //     )
    //   }, 5000)
    // }
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

  private _initFillsQueue(options: QueuesManagerOptions): FillsQueue {
    return new Queue({
      name: 'Fills',
      parallels: Math.ceil(options.parser.config.parallels.defaultValue / 2),
      factory: async (designIds: string[]) => {
        const [designId] = designIds
        const result = await this._queues.nodeRequests.exec(this._parser.rm.fills.prepareRequest(designId))
        return [Queue.safeValue(result)]
      },
    })
  }

  private _initFigmaS3Queue(options: QueuesManagerOptions): FigmaS3Queue {
    return new Queue({
      name: 'Figma S3',
      parallels: options.parser.config.parallels.figmaS3,
      factory: async (urls: string[]) => {
        const [url] = urls
        const response = await this._parser.downloader.rawRequest((raw: KyInstance) => {
          return raw.get(url)
        })
        const buffer = await response.buffer
        return [Queue.safeValue(buffer)]
      },
    })
  }

  private _initPreviewsDescriptorsQueue(options: QueuesManagerOptions): PreviewsDescriptorsQueue {
    return new Queue({
      name: 'Previews Descriptors',
      parallels: options.parser.config.parallels.previews,
      factory: async (urls: string[]) => {
        const [url] = urls
        const response = await this._parser.downloader.getJSON(url)
        return [Queue.safeValue(response)]
      },
    })
  }

  private _initPreviewsQueue(): PreviewsQueue {
    return new Queue({
      name: 'Previews Merger',
      parallels: 1,
      factory: async (nodes: Node[]) => {
        const previewsEndpoint = this._parser.rm.previews
        const groups = previewsEndpoint.groupRequests(nodes)
        const tasks = groups.map((group) => {
          return previewsEndpoint.prepareRequest(group.designId, group.nodeIds)
        })
        const responses = (await Promise.all(
          this._queues.previewsDescriptors.execMany(tasks)
        )) as FigmaPreviewsResponse[]
        const s3Links = previewsEndpoint.ungroupResponses(responses, groups, nodes)
        const promises = this._queues.figmaS3.execMany(s3Links)
        return Promise.all(promises.map(async (promise) => Queue.safeValue(await promise)))
      },
      drainLimit: null,
    })
  }

  private _initRenditionsDescriptorsQueue(options: QueuesManagerOptions): RenditionsDescriptorsQueue {
    return new Queue({
      name: 'Renditions Descriptors',
      parallels: options.parser.config.parallels.renditions,
      factory: async (requests: { url: string; options: RenditionRequestOptions }[]) => {
        const [request] = requests
        const { url, options } = request
        const response = await this._parser.downloader.clientRequest((raw: KyInstance) => {
          return raw.post(url, options)
        })
        return [Queue.safeValue(await response.json)]
      },
    })
  }

  private _initRenditionsQueue(): RenditionsQueue {
    return new Queue({
      name: 'Renditions Merger',
      parallels: 1,
      factory: async (ids: string[]) => {
        const renditionsEndpoint = this._parser.rm.renditions
        const groups = renditionsEndpoint.groupRequests(ids)
        const tasks = groups.map((group) => {
          return renditionsEndpoint.prepareRequest(group)
        })

        const responses = (await Promise.all(
          this._queues.renditionsDescriptors.execMany(tasks)
        )) as FigmaRenditionsResponse[]
        const s3LinksMap = renditionsEndpoint.ungroupResponses(responses)
        const resultsMap = Object.fromEntries(
          await Promise.all(
            Object.entries(s3LinksMap).map(async ([id, link]) => {
              const buffer = await this._queues.figmaS3.exec(link)
              return [id, buffer]
            })
          )
        )
        return ids.map((id) => Queue.safeValue(resultsMap[id]))
      },
      drainLimit: null,
    })
  }

  private _initLibrariesQueue(): LibrariesQueue {
    return new Queue({
      name: 'Libraries Queue',
      parallels: 10,
      factory: async (componentIds: string[]) => {
        const [componentId] = componentIds
        const response = await this._parser.downloader.getJSONSafe(this._parser.rm.library.prepareRequest(componentId))
        if (response.error) {
          return [Queue.safeValue(null)]
        }
        const componentMeta = response.value as FigmaComponent
        const id = { designId: componentMeta.meta.file_key, nodeId: componentMeta.meta.node_id }
        const component = await this._queues.partialSync.exec(id)
        const descriptor = { ...id, component }
        return [Queue.safeValue(descriptor)]
      },
    })
  }

  get queues(): Queues {
    return this._queues
  }
}
