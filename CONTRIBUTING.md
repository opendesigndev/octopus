# Contributing to Octopus repositories

👋 Thanks for your help improving the project! We are so happy to have you!

It's possible to contribute to Octopus repositories at any level. No contribution is too small and all contributions are valued.

# Conduct

Octopus repositories adhere to the [Code of Conduct](./CODE_OF_CONDUCT.md). This describes the minimum behavior expected from all contributors.

# Issues and pull requests

Pull Requests are the way concrete changes are made to the code, documentation, and dependencies in the Octopus repositories.

Even small pull requests are greatly appreciated. If you want to provide a large change, it is usually a good idea to first open an issue describing the change to solicit feedback and guidance. This will increase the likelihood of the PR getting merged. Also, please explain in detail the problem you are trying to solve and how you solved it.

Please submit bug reports, feature requests, and questions in our [issue board](https://github.com/opendesigndev/octopus/issues).

Before creating a new issue, please search the issue board and make sure that no one else has already created an issue with the same topic. Duplicate issues will be closed with a link referring to the previously created issue.

Once submitted, our development team will examine your work and assign appropriate labels. We may also suggest changes to ensure that your work aligns closer to our project goals.

# Development guide

If you want to provide some changes for Octopus repositories, here's a guide on getting started.

## Setting up your development environment

To develop the project, clone the repository on your computer. Octopus repositories are mainly monorepositories. You can install all the packages by executing `yarn` command in the root of monorepository. Also, each separate package could be installed just by executing `yarn` in its corresponding directory.

Most of packages are TypeScript projects, but few of them consist of Rust or Go parts.

For more details on each individual package, please follow corresponding `README.md` files.

## Building, testing, bundling and other actions

There are multiple npm scripts you can use when working with Octopus codebase:

- `yarn build`: builds JavaScript artifacts and type definitions using TypeScript compiler
- `yarn watch`: runs TypeScript compiler in watch mode so that you can immediately examine your changes
- `yarn test`: launches both unit and integration tests
- `yarn typedoc`: generates documentation for corresponding project

## Code style

We use ESLint and Prettier to lint our code and check code style. Please ensure that all code passes the linting and code style checks.

To manually lint and check code style, run `yarn lint`.
