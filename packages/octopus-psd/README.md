# Octopus Converter for Photoshop

Adobe Photoshop to Octopus 3 converter.

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

---

## Usage

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

## Demo: Node Examples

#### .env demo variables

ENV variables for our demo scripts located in `/examples/node/*`

| Variable              | Type    | Description                                                    |
| --------------------- | ------- | -------------------------------------------------------------- |
| SHOULD_RENDER         | boolean | if true will trigger ODE rendering when octopus3.json is ready |
| ODE_RENDERER_CMD      | string  | path to ODE rendering command (e.g. orchestrator4.run)         |
| ODE_IGNORE_VALIDATION | boolean | ignores the ODE rendering validation                           |
| FONTS_PATH            | string  | path to directory with fonts                                   |

### Convert .PSD file

#### yarn convert:debug

Designed for manual runs.

```
yarn convert:debug sample/some-file.psd
```

When it receives directory as parameter, it will convert all photoshop files located there.

```
yarn convert:debug sample
```

#### yarn convert:local

Designed for running in automated runs.

```
yarn convert:local sample/some-file.psd
```

---

#### Instantiation of PSDFileReader

You can instantiate PSDFileReader with optional flag withRenderer.
This will include library @opendesign/image-icc-profile-converter in the image processing pipeline.
The process will convert all output images to `sRGB` if PSD file was saved with embedded colour profile. This might make a difference especially for images composed in CMYK colour space.

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

Runs Unit tests using Jest framework.

#### Integration Tests

```
yarn test:integration
```

Runs Integration tests using our custom framework.
Tries to convert `octopus components` + `manifest` for saved designs and compares them using `jsondiffpatch` with saved expected output.

## Dependencies

#### @webtoon

`octopus-psd` has a dependency on `@webtoon` [project](https://github.com/webtoon/psd) to which OpenDesign team has been contributing. Changes proposed by the OpenDesign team have been first applied to our own fork (npm: [`@opendesign/psd-ts`](https://www.npmjs.com/package/@opendesign/psd-ts)) and partially merged into webtoon's repository.

Currently, there is one merge request from OpenDesign into webtoon and without which octopus-psd would not work. Therefore, octopus-psd is seemingly importing from `@webtoon/psd`, but in reality imports are done from `@opendesign/psd-ts`. This bridge (or proxy) is visible in `package.json`

```
    "@webtoon/psd-ts": "npm:@opendesign/psd-ts@0.5.0"
```

How to make changes in @webtoon dependency:

1. Pull [https://github.com/opendesigndev/psd-ts](https://github.com/opendesigndev/psd-ts).
2. Make a pull request to `opendesigndev/psd-ts` (when doing pull request on GitHub, make sure branch you are pushing to is `main` from OpenDesign).
3. When everything is merged, create a pull request from OpenDesign GitHub page to merge `main` branch into webtoon's repository.
4. If you are proxying dependency from webtoon with `opendesign/psd-ts`, switch to branch `experimental-release` and read about "release process" in README and apply.
5. Update your `package.json` in octopus-psd accordingly.
