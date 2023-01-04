# Octopus Converter for Figma

Figma HTTP API format to Octopus 3 converter.

## Install

```
yarn add @opendesign/octopus-fig
```

### .env variables

If missing `.env` file, make a copy of `.env.example` and rename it to `.env` and fill correct info.

| Variable  | Type                                                 | Description      |
| --------- | ---------------------------------------------------- | ---------------- |
| NODE_ENV  | production / development / debug                     | Node environment |
| LOG_LEVEL | fatal / error / warn / info / debug / trace / silent | Log level        |

---

## Usage

There are three main processing steps:

- reading source data (using _readers_)
- conversion (using _converter_ with `EventEmitter` instance produced by a reader)
- exporting (using _exporters_)

Readers used in other Octopus converters return `SourceDesign` instance, which is an object with static values inside.
In case of Figma, we have slightly different approach because of it's asynchronous origin (requesting values using HTTP).
So, to provide source data as fast as possible to the converter we use `EventEmitter` inside of Figma Reader's `SourceDesign` instance.
This makes it possible to process data almost as fast as it's downloaded from Figma's API.

Although you can define the way of reading assets or exporting results yourself (create your own reader/exporter class), you can also choose between existing ones:

Check [`examples/node/convert-api-local.ts`](./examples/node/convert-api-local.ts) for example usage in automated runs.

Check [`examples/node/convert-api-debug.ts`](./examples/node/convert-api-debug.ts) for example usage in custom manual runs.

Check [`examples/web/`](./examples/web/) for more details about usage in web browsers.

Check [`src/services/exporters/`](./src/services/exporters/) for more details about exporters.

Check [`src/services/readers/`](./src/services/readers/) for more details about readers

---

## Demo: Example Node

Converts your Figma designs from API into Octopus3+ format.
Before you start you need to add [your Figma API token](https://www.figma.com/developers/api#access-tokens) into `.env` file.
Then you need to find `FIGMA_DESIGN_HASH` for the design you want to convert.
You can find it in the URL of the design: `https://www.figma.com/file/__HERE__/...`

#### .env demo variables

ENV variables for our demo scripts which are located in `/`examples/node/\*`

| Variable              | Type    | Description                                                    |
| --------------------- | ------- | -------------------------------------------------------------- |
| API_TOKEN             | string  | Figma API token                                                |
| SHOULD_RENDER         | boolean | if true will trigger ODE rendering when octopus3.json is ready |
| ODE_RENDERER_CMD      | string  | path to ODE renderer command (e.g. ode-renderer-cli)           |
| ODE_IGNORE_VALIDATION | boolean | ignores the ODE rendering validation                           |
| FONTS_PATH            | string  | path to directory with fonts                                   |

### yarn convert:debug

Designed for manual runs.

```
yarn
yarn convert:debug FIGMA_DESIGN_HASH
```

### yarn convert:local

Designed for running in automated runs.

```
yarn
yarn convert:local FIGMA_DESIGN_HASH
```

---

## Demo: Example Web

Run `yarn bundle` and then open `examples/web/index.html` in [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
Look for `Result:` in console output.

---

## TypeDoc

Command `yarn typedoc` will generate TypeDoc documentation for public Classes into `./docs` folder

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
Tries to convert `octopus components` + `manifest` for saved designs and compares them using `jsondiffpatch` with saved expected output.
