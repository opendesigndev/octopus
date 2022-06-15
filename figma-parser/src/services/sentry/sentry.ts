export interface Sentry {
  captureMessage(msg: string, context: Record<PropertyKey, unknown>): unknown
  captureEvent(event: unknown): unknown
  captureException(exception: Error | string, context: Record<PropertyKey, unknown>): unknown
}
