import TS from 'time-stamp'

export function timestamp(): string {
  return TS('YYMMDD-HHmmss')
}
