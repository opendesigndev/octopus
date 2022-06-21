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
| NODE_ENV                    | production / development / debug                     | Node environment                                           |
| LOG_LEVEL                   | fatal / error / warn / info / debug / trace / silent | Log level                                                  |
| SENTRY_DSN                  | string                                               | Sentry DSN                                                 |
| CONVERT_RENDER              | boolean                                              | if true will trigger rendering when octopus3.json is ready |
| RENDERING_PATH              | string                                               | path to rendering command (e.g. orchestrator4.run)         |
| RENDERING_IGNORE_VALIDATION | boolean                                              | ignores the rendering validation                           |
| FONTS_PATH                  | string                                               | path to directory with fonts                               |
| API_TOKEN                   | string                                               | Figma API token                                            |

## Convert Figma file

### yarn convert:local

Designed for running in automated runs.

```
yarn convert:local figma_design_hash
```

### yarn convert:debug

Designed for manual runs.

```
yarn convert:debug figma_design_hash
```

## Unit Tests

```
yarn test
```
