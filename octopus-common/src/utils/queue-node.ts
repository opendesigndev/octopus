import { detachPromiseControls } from './async.js'

export type SafeResult<T> = { error: null; value: T } | { error: Error; value: void }
export type QueueOptions<T, U> = {
  name: string
  parallels: number
  drainLimit?: number
  factory: (tasks: T[]) => Promise<SafeResult<U>[]>
}
export type TaskControl<T> = { task: T; resolve: (value?: unknown) => unknown; reject: (value?: unknown) => unknown }

export class Queue<T, U> {
  _name: string
  _factory: (tasks: T[]) => Promise<SafeResult<U>[]>
  _available: number
  _working: number
  _drainLimit: number
  _awaiting: (() => void)[]
  _tasks: TaskControl<T>[]

  constructor(options: QueueOptions<T, U>) {
    const { name, factory, parallels, drainLimit = 1 } = options

    this._name = name
    this._factory = factory
    this._available = parallels
    this._drainLimit = drainLimit
    this._tasks = []
    this._awaiting = []
    this._working = 0
  }

  get status(): { name: string; available: number; working: number; enqueued: number } {
    return {
      name: this._name,
      available: this._available,
      working: this._working,
      enqueued: this._awaiting.length,
    }
  }

  _getTasks(): TaskControl<T>[] {
    return typeof this._drainLimit === 'number' ? this._tasks.splice(0, this._drainLimit) : this._tasks.splice(0)
  }

  _finalizeTask(): void {
    this._working--
    this._available++
    queueMicrotask(() => this._try())
  }

  _try(): void {
    if (this._available > 0 && this._awaiting.length) {
      this._available--
      const runner = this._awaiting.shift()
      if (typeof runner === 'function') {
        runner()
      }
    }
  }

  _resolveTasksWithResults(tasks: TaskControl<T>[], results: SafeResult<U>[]): void {
    this._finalizeTask()
    if (!Array.isArray(results) || tasks.length !== results.length) {
      throw new Error('Results are not an array or has different length than tasks input.')
    }
    results.forEach((result, index) => {
      const { value, error } = result
      const { resolve, reject } = tasks[index]
      queueMicrotask(() => {
        error ? reject(error) : resolve(value)
      })
    })
  }

  _rejectTasks(tasks: TaskControl<T>[], err: Error): void {
    this._finalizeTask()
    tasks.forEach((task) => task.reject(err))
  }

  _createRunner(): () => Promise<void> {
    return async (): Promise<void> => {
      this._working++
      const tasks = this._getTasks()
      if (!tasks.length) {
        this._finalizeTask()
        return
      }
      try {
        const results: SafeResult<U>[] = await this._factory(tasks.map((task) => task.task))
        this._resolveTasksWithResults(tasks, results)
      } catch (err) {
        this._rejectTasks(tasks, err)
      }
    }
  }

  exec(task: T): Promise<U> {
    const { promise, resolve, reject } = detachPromiseControls<U>()
    this._tasks.push({ task, resolve, reject })
    this._awaiting.push(this._createRunner())
    process.nextTick(() => this._try())
    return promise
  }
}
