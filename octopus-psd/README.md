# Octopus Converter for Photoshop

Photoshop to Octopus 3 converter.

## Install

```
yarn
```

### .env variables

If missing `.env` file, make a copy of `.env.example` and rename it to `.env` and fill correct info.

| Variable                    | Type                                                 | Description                                                |
| --------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| NODE_ENV                    | production / development / debug                     | Node environment                                           |
| LOG_LEVEL                   | fatal / error / warn / info / debug / trace / silent | Log level                                                  |
| SENTRY_DSN                  | string                                               | Sentry DSN                                                 |
| CONVERT_RENDER              | boolean                                              | if true will trigger rendering when octopus3.json is ready |
| RENDERING_PATH              | string                                               | path to rendering command (e.g. orchestrator4.run)         |
| RENDERING_IGNORE_VALIDATION | boolean                                              | ignores the rendering validation                           |
| FONTS_PATH                  | string                                               | path to directory with fonts                               |

## Convert .PSD file

### yarn convert:psd:local

Designed for running in automated runs.

```
yarn convert:psd:local sample/some-file.psd
```

### yarn convert:psd:debug

Designed for manual runs.

```
yarn convert:psd:debug sample/some-file.psd
```

When it receives directory as parameter, it will convert all photoshop files located there.

```
yarn convert:psd:debug sample
```

## Convert parsed source.json file

Use if you have your PSD file already parsed by https://github.com/psd-tools/psd-tools/.
As a parameter the scripts needs path to directory in which is located parsed `source.json` together with folder `pictures` in which are located parsed images.

### yarn convert:source:local

Designed for running in automated runs.

```
yarn convert:source:local path/to/dir
```

### yarn convert:source:debug

Designed for manual runs.

```
yarn convert:source:debug path/to/dir
```

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
import { OctopusPSDConverter, PSDFileReader, LocalExporter } from '../src'

async function convert() {
  const [filePath] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())
  const reader = new PSDFileReader({ path: filePath })
  const sourceDesign = await reader.sourceDesign
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const converter = new OctopusPSDConverter({ sourceDesign })
  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()
  await reader.cleanup()
  console.log(`Input: ${filePath}`)
  console.log(`Output: ${testDir}`)
}

convert()
```

Check `src/services/exporters/` for more details about exporters.

Check `src/services/readers/` for more details about readers

## Unit Tests

```
yarn test
```
