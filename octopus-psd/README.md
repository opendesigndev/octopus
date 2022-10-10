# Octopus Converter for Photoshop

Photoshop to Octopus 3 converter.

## Install

```
yarn add @opendesign/octopus-psd
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

Check [`examples/node/convert-psd-local.ts`](./examples/node/convert-api-local.ts) for example usage in automated runs.

Check [`examples/node/convert-psd-debug.ts`](./examples/node/convert-api-debug.ts) for example usage in custom manual runs.

Check [`src/services/exporters/`](./src/services/exporters/) for more details about exporters.

Check [`src/services/readers/`](./src/services/readers/) for more details about readers

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

Runs Unit tests using Jest framework.

#### Integration Tests

```
yarn test:integration
```

Runs Integration tests using our custom framework.
Tries to convert `octopus components` + `manifest` for saved designs and compares them using `jsondiffpatch` with saved expected output.
