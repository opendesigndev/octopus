# Octopus Converters

Monorepository for Octopus 3+ converters and related tools.

# Packages

Packages are available at `/packages` directory.

# How converters work?

TBD

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
