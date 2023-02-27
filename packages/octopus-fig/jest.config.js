/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  resolver: 'ts-jest-resolver',
}
