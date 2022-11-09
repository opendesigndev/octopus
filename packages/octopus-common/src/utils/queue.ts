import { detachPromiseControls } from './async'

export type SafeResult<T> = { error: null; value: T } | { error: Error; value: void }
export type QueueOptions<T, U> = {
  name: string
  parallels: number
  drainLimit?: number | null
  factory: (tasks: T[]) => Promise<SafeResult<U>[]>
}
export type TaskControl<T> = { task: T; resolve: (value?: unknown) => unknown; reject: (value?: unknown) => unknown }

export class Queue<T, U> {
  private _name: string
  private _factory: (tasks: T[]) => Promise<SafeResult<U>[]>
  private _available: number
  private _working: number
  private _drainLimit: number | null
  private _awaiting: number
  private _tasks: TaskControl<T>[]

  static safeValue<T>(value: T): SafeResult<T> {
    return { value, error: null }
  }

  static safeError<T>(err: Error): SafeResult<T> {
    return { value: undefined, error: err }
  }

  constructor(options: QueueOptions<T, U>) {
    const { name, factory, parallels, drainLimit = 1 } = options

    this._name = name
    this._factory = factory
    this._available = parallels
    this._drainLimit = drainLimit
    this._tasks = []
    this._awaiting = 0
    this._working = 0
  }

  get status(): { name: string; available: number; working: number; enqueued: number } {
    return {
      name: this._name,
      available: this._available,
      working: this._working,
      enqueued: this._awaiting,
    }
  }

  private _getTasks(): TaskControl<T>[] {
    return typeof this._drainLimit === 'number' ? this._tasks.splice(0, this._drainLimit) : this._tasks.splice(0)
  }

  private _finalizeTask(): void {
    this._working--
    this._available++
    queueMicrotask(() => this._try())
  }

  private _try(): void {
    if (this._available > 0 && this._awaiting) this._run()
  }

  private _resolveTasksWithResults(tasks: TaskControl<T>[], results: SafeResult<U>[]): void {
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

  private _rejectTasks(tasks: TaskControl<T>[], err: Error): void {
    this._finalizeTask()
    tasks.forEach((task) => task.reject(err))
  }

  private async _run(): Promise<void> {
    this._available--
    this._working++
    const tasks = this._getTasks()
    if (!tasks.length) {
      this._finalizeTask()
      return
    }
    this._awaiting -= tasks.length
    try {
      const results: SafeResult<U>[] = await this._factory(tasks.map((task) => task.task))
      this._resolveTasksWithResults(tasks, results)
    } catch (err) {
      this._rejectTasks(tasks, err)
    }
  }

  exec(task: T): Promise<U> {
    const { promise, resolve, reject } = detachPromiseControls<U>()
    this._tasks.push({ task, resolve, reject })
    this._awaiting++
    queueMicrotask(() => this._try())
    return promise
  }

  /**
   * Optimized way to call multiple exec() at once.
   * Instead of spawning multiple parallels per task when queue is empty,
   * executes only one parallel with drainer if available.
   *
   * Returns Promise<U>[] instead of Promise<U[]> so it's possible to handle each
   * promise separately.
   * */
  execMany(tasks: T[]): Promise<U>[] {
    const promises = tasks.map((task) => {
      const { promise, resolve, reject } = detachPromiseControls<U>()
      this._tasks.push({ task, resolve, reject })
      this._awaiting++
      queueMicrotask(() => this._try())
      return promise
    })
    return promises
  }
}
