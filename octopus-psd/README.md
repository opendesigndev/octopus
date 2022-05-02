# Octopus Converter for Photoshop

Photoshop to Octopus 3 converter.

## Install

```
yarn
```

### .env variables

If missing `.env` file, make a copy of `.env.example` and rename it to `.env` and fill correct info.

| Variable       | Type                                                 | Description                                                |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| NODE_ENV       | production / development / debug                     | Node environment                                           |
| LOG_LEVEL      | fatal / error / warn / info / debug / trace / silent | Log level                                                  |
| SENTRY_DSN     | string                                               | Sentry DSN                                                 |
| CONVERT_RENDER | boolean                                              | if true will trigger rendering when octopus3.json is ready |
| RENDERING_PATH | string                                               | path to rendering command (e.g. orchestrator4.run)         |
| FONTS_PATH     | string                                               | path to directory with fonts                               |

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

## Unit Tests

```
yarn test
```
