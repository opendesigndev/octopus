/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '@opendesign/illustrator-parser-pdfcpu/dist/fs_context':
      '<rootDir>/node_modules/@opendesign/illustrator-parser-pdfcpu/dist/fs_context.cjs',
    '@opendesign/illustrator-parser-pdfcpu/dist/index':
      '<rootDir>/node_modules/@opendesign/illustrator-parser-pdfcpu/dist/index.cjs',
  },
}
