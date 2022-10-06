# Octopus Converter for Photoshop

Photoshop to Octopus 3 converter.

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
| SHOULD_RENDER         | boolean | if true will trigger ODE rendering when octopus3.json is ready |
| ODE_RENDERER_CMD      | string  | path to ODE rendering command (e.g. orchestrator4.run)         |
| ODE_IGNORE_VALIDATION | boolean | ignores the ODE rendering validation                           |
| FONTS_PATH            | string  | path to directory with fonts                                   |

---

## Demo: Node Examples

### Convert .PSD file

#### yarn convert:psd:debug

Designed for manual runs.

```
yarn convert:psd:debug sample/some-file.psd
```

When it receives directory as parameter, it will convert all photoshop files located there.

```
yarn convert:psd:debug sample
```

#### yarn convert:psd:local

Designed for running in automated runs.

```
yarn convert:psd:local sample/some-file.psd
```

### Convert parsed source.json file

Use if you have your PSD file already parsed by https://github.com/psd-tools/psd-tools/.
As a parameter the scripts needs path to directory in which is located parsed `source.json` together with folder `pictures` in which are located parsed images.

#### yarn convert:source:debug

Designed for manual runs.

```
yarn convert:source:debug path/to/dir
```

#### yarn convert:source:local

Designed for running in automated runs.

```
yarn convert:source:local path/to/dir
```

---

## Custom Usage

There are three main processing steps:

- reading source data (using _readers_)
- conversion (using _convertor_ with `SourceDesign` instance produced by reader)
- exporting (using _exporters_)

Although you can define the way of reading assets or exporting results yourself (create your own reader/exporter class), you can also choose between existing ones.

```ts
import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

/**
 * Reader (`PSDFileReader`) reads `.psd` files by given path.
 * Exporter (`LocalExporter`) defines how and where save outputs.
 * Converter takes `SourceDesign` entitiy which should be available from reader as constructor option and exporter as convertDesign option.
 */
import { LocalExporter, OctopusPSDConverter, PSDFileReader } from '../src'

const converter = new OctopusPSDConverter()

async function convert() {
  const [filePath] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())

  const reader = new PSDFileReader({ path: filePath })
  const sourceDesign = await reader.sourceDesign
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const exporter = new LocalExporter({ path: testDir })

  await converter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()

  console.info()
  console.info(`Input: ${filePath}`)
  console.info(`Output: ${testDir}`)

  await reader.cleanup()
}

convert()
```

Check `example-node/` for more details about usage in node.

Check `src/services/exporters/` for more details about exporters.

Check `src/services/readers/` for more details about readers.

---

## Unit Tests

```
yarn test
```
