# Octopus Converter for Adobe XD

Adobe XD to Octopus 3 converter.

## Install

```
yarn
```

---

## Usage

There are three main processing steps:

- reading source data (using _readers_)
- conversion (using _convertor_ with `SourceDesign` instance produced by reader)
- exporting (using _exporters_)

Although you can define the way of reading assets or exporting results yourself (create your own reader/exporter class), you can also choose between existing ones:

```ts
import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

/**
 * Reader (`XDFileReader`) reads `.xd` files by given path.
 * Exporter (`LocalExporter`) defines how and where save outputs.
 * Converter takes `SourceDesign` entitiy which should be available from reader as constructor option and exporter as convertDesign option.
 */
import { OctopusXDConverter, LocalExporter, XDFileReader } from '../src'

async function convert() {
  const [filename] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())
  const reader = new XDFileReader({ path: filename, storeAssetsOnFs: true })
  const sourceDesign = await reader.sourceDesign
  const converter = new OctopusXDConverter({ sourceDesign })
  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()
  await reader.cleanup()
  console.log(`Input: ${filename}`)
  console.log(`Output: ${testDir}`)
}

convert()
```

Check `src/services/conversion/exporter` for more details about exporters.

Check `src/services/conversion/xd-file-reader` for more details about readers

---

## Environment

You can create `.env` file which will be autoloaded using `dotenv`.

| Variable       | Type                                                 | Description                                                |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| NODE_ENV       | production / development / debug                     | Node environment                                           |
| LOG_LEVEL      | fatal / error / warn / info / debug / trace / silent | Log level                                                  |
| SENTRY_DSN     | string                                               | Sentry DSN                                                 |
| CONVERT_RENDER | boolean                                              | if true will trigger rendering when octopus3.json is ready |
| RENDERING_PATH | string                                               | path to rendering command (e.g. orchestrator4.run)         |
| FONTS_PATH     | string                                               | path to directory with fonts                               |

---

## Scripts

### Convert to temporary directory

```
yarn convert:all PATH_TO_XD_FILE
```

Converts XD file located at `PATH_TO_XD_FILE` to temporary directory.

### Debug

```
yarn convert:all:debug PATH_TO_XD_FILE
```

Useful and verbose script for debugging. Accepts multiple paths.

---

## Unit Tests

```
yarn test
```
