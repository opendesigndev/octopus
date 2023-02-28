import TS from 'time-stamp'

export function timestamp(): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return TS('YYMMDD-HHmmss')
}
