# Octopus Converter for Adobe Illustrator

Adobe Illustrator to Octopus 3+ converter.

## Install

```
yarn add @opendesign/octopus-ai
```

## Usage

There are three main processing steps:

- reading source data using `sourceDesign` getter from `AIFileReader` instance and obtaining `SourceDesign` instance
- conversion of SourceDesign instance using `convertDesign` method of `OctopusAIConverter` instance
- exporting using exporter passed in to `convertDesign` method of `OctopusAIConverter` instance

Although you can define the way of reading assets or exporting results yourself (create your own reader/exporter class), you can also choose between existing ones:

Check [`examples/node/convert-local.ts`](./examples/node/convert-local.ts) for example usage in automated runs.

Check [`examples/node/convert-debug.ts`](./examples/node/convert-debug.ts) for example usage in custom manual runs.

Check [`examples/web/`](./examples/web/) for more details about usage in web browsers.

Check [`src/services/conversion/exporters/`](./src/services/conversion/exporters/index.ts) for more details about exporters.

Check [`src/services/readers/`](./src/services/readers) for more details about AIFileReaderNode and AIFileReaderWeb

When using `@opendesign/octopus-ai` as external package in `NodeJS`, all dependencies can be imported from root folder, when using in `Browser` environment, dependencies should be imported from `'@opendesign/octopus-ai/web.mjs'`. 



## TypeDoc

Command `yarn typedoc` will generate TypeDoc documentation for public Classes into `./docs` folder

## Demo: Node Examples

Converts your Adobe Illustrator designs into Octopus3+ format.
You need path to Adobe Illustrator file you wish to convert.

### yarn convert:debug

Designed for manual runs.

```
yarn convert:debug PATH_TO_AI_FILE
```

### yarn convert:local

Designed for running in automated runs.

```
yarn convert:local PATH_TO_AI_FILE
```

## Demo: Example Web

Run `yarn bundle` and then open `examples/web/dist/index.html` in [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
Make sure that links in generated `index.html` are correctly setup by configuring your live server or placing generated `.js`  and `.wasm` files in corresponding folder (`/assets`).
Look for `Result:` in console output.
### .env variables

If missing `.env` file, make a copy of `.env.example` and rename it to `.env` and fill correct info.

| Variable  | Type                                                 | Description      |
| --------- | ---------------------------------------------------- | ---------------- |
| NODE_ENV  | production / development / debug                     | Node environment |
| LOG_LEVEL | fatal / error / warn / info / debug / trace / silent | Log level        |

#### .env demo variables

ENV variables for our demo scripts located in `/examples/node/*`

| Variable              | Type    | Description                                                    |
| --------------------- | ------- | -------------------------------------------------------------- |
| SHOULD_RENDER         | boolean | if true will trigger ODE rendering when octopus3.json is ready |
| ODE_RENDERER_CMD      | string  | path to ODE renderer command (e.g. ode-renderer-cli)           |
| ODE_IGNORE_VALIDATION | boolean | ignores the ODE rendering validation                           |
| FONTS_PATH            | string  | path to directory with fonts                                   |
| OUTPUT_DIR            | string  | relative path to directory where output is saved               |

## Tests

```
yarn test
```

Runs Unit & Integration tests.

#### Unit Tests

```
yarn test:unit
```

Runs Unit tests using jest framework.

#### Integration Tests

```
yarn test:integration
```

Runs Integration tests using our custom framework.
Converts saved Adobe Illustrator designs in
[`test/integration/assets`](./test/integration/assets) folder and compares outputs to before saved outputs using `jsondiffpatch`

```
yarn test:integration:update
```

Creates and saves octopus and manifest files which will be used for comparison in integration testing.

&nbsp;

To both of these commands it is possible to pass test name and test/update only that particular test.

For example:

```
yarn test:integration:update boolean-ops
```

or

```
yarn test:integration boolean-ops
```

&nbsp;

[![License](https://img.shields.io/badge/license-Apache%202.0-green)](https://www.apache.org/licenses/LICENSE-2.0)
[![Editor](https://img.shields.io/badge/editor-Adobe%20Illustrator-orange)](https://www.adobe.com/products/illustrator.html)
[![Types](https://img.shields.io/badge/types-Typescript-blue)](https://www.typescriptlang.org/docs/)
[![Environment](https://img.shields.io/badge/environment-Node.js-brightgreen)](https://nodejs.org/en/)
[![Format](https://img.shields.io/badge/format-Octopus%203%2B-blue)](https://octopus-schema.avocode.com/)
