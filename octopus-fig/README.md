# Octopus Converter for Figma

Figma to Octopus 3 converter.

## Install

```
yarn
```

### .env variables

If missing `.env` file, make a copy of `.env.example` and rename it to `.env` and fill correct info.

| Variable  | Type                                                 | Description      |
| --------- | ---------------------------------------------------- | ---------------- |
| NODE_ENV  | production / development / debug                     | Node environment |
| LOG_LEVEL | fatal / error / warn / info / debug / trace / silent | Log level        |

#### .env demo variables

ENV variables for our demo scripts located in `/example-node/*`

| Variable              | Type    | Description                                                    |
| --------------------- | ------- | -------------------------------------------------------------- |
| API_TOKEN             | string  | Figma API token                                                |
| SHOULD_RENDER         | boolean | if true will trigger ODE rendering when octopus3.json is ready |
| ODE_RENDERER_CMD      | string  | path to ODE renderer command (e.g. ode-renderer-cli)           |
| ODE_IGNORE_VALIDATION | boolean | ignores the ODE rendering validation                           |
| FONTS_PATH            | string  | path to directory with fonts                                   |

---

## Demo: Example Node

Converts your Figma designs from API into Octopus3+ format.
Before you start you need to add [your Figma API token](https://www.figma.com/developers/api#access-tokens) into `.env` file.
Then you need to find `FIGMA_DESIGN_HASH` for the design you want to convert.
You can find it in the URL of the design: `https://www.figma.com/file/__HERE__/...`

### yarn convert:debug

Designed for manual runs.

```
yarn convert:debug FIGMA_DESIGN_HASH
```

### yarn convert:local

Designed for running in automated runs.

```
yarn convert:local FIGMA_DESIGN_HASH
```

Check `example-node/` for more details about usage in node.

---

## Demo: Example Web

Run `yarn bundle` and then open `example-web/index.html` in [live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
Look for `Result:` in console output.

Check `example-web/` for more details about usage in web browser.

---

## Usage

There are three main processing steps:

- reading source data (using _readers_)
- conversion (using _converter_ with `DesignEmitter` instance produced by reader)
- exporting (using _exporters_)

Although you can define the way of reading assets or exporting results yourself (create your own reader/exporter class), you can also choose between existing ones:

```ts
import os from 'os'
import path from 'path'

import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { LocalExporter, createConverter, SourceApiReader } from '../src/index-node'

dotenv.config()

const converter = createConverter()

async function convertDesign(designId: string) {
  const testDir = path.join(os.tmpdir(), uuidv4())

  const readerOptions = {
    designId,
    token: process.env.API_TOKEN as string,
    ids: [],
    host: 'api.figma.com',
    pixelsLimit: 1e7,
    framePreviews: true,
    previewsParallels: 3,
    tokenType: 'personal',
    nodesParallels: 10,
    s3Parallels: 10,
    verbose: true,
    figmaIdsFetchUsedComponents: true,
    renderImagerefs: false,
    shouldObtainLibraries: true,
    shouldObtainStyles: true,
    parallelRequests: 5,
  }
  const reader = new SourceApiReader(readerOptions)

  const exporter = new LocalExporter({ path: testDir })

  await converter.convertDesign({ designEmitter: reader.parse(), exporter })
  await exporter.completed()

  console.info()
  console.info(`Output: file://${testDir}`)
}

const designId = process.argv[2]
convertDesign(designId)
```

Check `example-node/` for more details about usage in node.

Check `example-web/` for more details about usage in web browser.

Check `src/services/exporters/` for more details about exporters.

Check `src/services/readers/` for more details about readers

---

## Tests

```
yarn test
```

runs unit & integration tests
