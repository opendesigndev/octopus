/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

export default {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  resolver: 'ts-jest-resolver',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
