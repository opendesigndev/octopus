# Octopus Converter for Adobe Illustrator

Adobe Illustrator to Octopus 3 converter.

## Install

```
yarn add @opendesign/octopus-ai
```

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

## Demo: Example Node

Converts your Adobe Illustrator designs from API into Octopus3+ format.
You need pass in path to Adobe Illustrator file you wish to convert.

### yarn convert:debug

Designed for manual runs.

```
yarn convert:debug <PATH-TO-AI-FILE>
```

### yarn convert:local

Designed for running in automated runs.

```
yarn convert:local <PATH-TO-AI-FILE>
```

## Usage

There are three main processing steps:

- reading source data using `sourceDesign` getter from `AIFileReader` instance and obtaining `SourceDesign` instance
- conversion of SourceDesign instance using `convertDesign` method of `OctopusAIConverter` instance
- exporting using exporters passed in to `convertDesign` method of `OctopusAIConverter` instance

Although you can define the way of reading assets or exporting results yourself (create your own reader/exporter class), you can also choose between existing ones:

Check [`examples/node/convert-api-local.ts`](./examples/node/convert-api-local.ts) for example usage in automated runs.

Check [`examples/node/convert-api-debug.ts`](./examples/node/convert-api-debug.ts) for example usage in custom manual runs.

Check [`src/services/conversion/exporters/`](./src/services/conversion/exporters/) for more details about exporters.

Check [`src/services/conversion/ai-file-reader/`](./src/services/conversion/ai-file-reader/index.ts) for more details about AIFileReader

---

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
