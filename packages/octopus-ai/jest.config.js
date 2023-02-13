/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resolver: './jest-resolver.cjs',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '@opendesign/illustrator-parser-pdfcpu/fs_context':
      '<rootDir>/node_modules/@opendesign/illustrator-parser-pdfcpu/dist/fs_context.cjs',
    '@opendesign/illustrator-parser-pdfcpu':
      '<rootDir>/node_modules/@opendesign/illustrator-parser-pdfcpu/dist/index.cjs',
    marky: '<rootDir>/node_modules/marky/lib/marky.cjs.js',
    immutable: '<rootDir>/node_modules/immutable/dist/immutable.js',
    'gl-matrix': '<rootDir>/node_modules/gl-matrix/gl-matrix.js',
  },
}
