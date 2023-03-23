import { benchmark } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

import type { BenchmarkServiceFactory } from '../benchmark-service-factory.js'

const createBenchmarkServiceNode: BenchmarkServiceFactory = () => benchmark

export { createBenchmarkServiceNode }
