# Octopus Converter for Photoshop

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
