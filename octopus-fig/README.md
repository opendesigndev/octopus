# Octopus Converter for Figma

Figma to Octopus 3 converter.

## Install

```
yarn
```

### .env variables

If missing `.env` file, make a copy of `.env.example` and rename it to `.env` and fill correct info.

| Variable                    | Type                                                 | Description                                                |
| --------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| API_TOKEN                   | string                                               | Figma API token                                            |
| NODE_ENV                    | production / development / debug                     | Node environment                                           |
| LOG_LEVEL                   | fatal / error / warn / info / debug / trace / silent | Log level                                                  |
| SENTRY_DSN                  | string                                               | Sentry DSN                                                 |
| CONVERT_RENDER              | boolean                                              | if true will trigger rendering when octopus3.json is ready |
| RENDERING_PATH              | string                                               | path to rendering command (e.g. orchestrator4.run)         |
| RENDERING_IGNORE_VALIDATION | boolean                                              | ignores the rendering validation                           |
| FONTS_PATH                  | string                                               | path to directory with fonts                               |

## Convert Figma design

Converts your Figma designs from API into Octopus3+ format.
Before you start you need to add [your Figma API token](https://www.figma.com/developers/api#access-tokens) into `.env` file.
Then you need to find `FIGMA_DESIGN_HASH` for the design you want to convert.
You can find it in the URL of the design: `https://www.figma.com/file/__HERE__/...`

### yarn convert:local

Designed for running in automated runs.

```
yarn convert:local FIGMA_DESIGN_HASH
```

### yarn convert:debug

Designed for manual runs.

```
yarn convert:debug FIGMA_DESIGN_HASH
```

## Unit Tests

```
yarn test
```
