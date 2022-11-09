import dotenv from 'dotenv'
import has from 'lodash/has'

dotenv.config()

export function fromEnv(envName: string, type: 'string', defaultValue?: string): string
export function fromEnv(envName: string, type: 'number', defaultValue?: number): number
export function fromEnv(envName: string, type: 'boolean', defaultValue?: boolean): boolean
export function fromEnv(envName: string, type: 'string', defaultValue?: string | null): string | null
export function fromEnv(envName: string, type: 'number', defaultValue?: number | null): number | null
export function fromEnv(envName: string, type: 'boolean', defaultValue?: boolean | null): boolean | null
export function fromEnv(
  envName: string,
  type: 'string' | 'number' | 'boolean' = 'string',
  defaultValue?: unknown
): string | number | boolean | unknown {
  const typeCasters = {
    string: String,
    boolean: Boolean,
    number: Number,
  }

  const value = process.env[envName]

  if (typeof value === 'undefined') {
    if (arguments.length < 3) {
      throw new Error(`Invalid value for environment variable "${envName}"`)
    }
    return defaultValue
  }

  if (typeof value === type) return value

  if (!has(typeCasters, type)) {
    throw new Error(`Can't convert "${envName}" to type "${type}"`)
  }

  const casted = typeCasters[type](value)

  if (type === 'number') {
    if (!Number.isFinite(casted)) {
      throw new Error(`Can't convert "${envName}" to type "${type}"`)
    }
  }

  return casted
}
