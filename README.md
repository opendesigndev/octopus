# Octopus Converters

Monorepository for Octopus 3+ converters and related tools. For detailed description of each separate subpackage, please visit `/packages` directory.

# Packages

- `@opendesign/figma-parser` - Figma REST API assets/files downloader. Used mainly as part of `@opendesign/octopus-fig`
- `@opendesign/octopus-ai` - Adobe Illustrator to Octopus isomorphic converter
- `@opendesign/octopus-common` - package representing general internal utility functions or modules used in most of converters
- `@opendesign/octopus-fig` - Figma to Octopus isomorphic converter
- `@opendesign/octopus-psd` - Adobe Photoshop to Octopus isomorphic converter
- `@opendesign/octopus-xd` - Adobe XD to Octopus isomorphic converter

# Scripts

- **`yarn build`**  
  Runs `build` script on each separate package.

- **`yarn clean`**  
  Removes `node_modules` and runs `clean` script on each separate package.

- **`yarn clean-init`**  
  Cleans, installs and builds every package.

- **`yarn test`**  
  Runs unit and integration tests on each package.

- **`yarn lint`**  
  Runs Prettier and eslint on each package.

- **`yarn lint:eslint`**  
  Runs only eslint on each package.

- **`yarn lint:prettier`**  
  Runs only Prettier on each package.

- **`yarn types:check`**  
  Validates TS types.

- **`yarn verify`**  
  Lints and tests all packages.
