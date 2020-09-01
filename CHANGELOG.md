# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/daskyrk/cube-state/compare/v1.1.3...v1.2.0) (2020-09-01)


### Bug Fixes

* prevent some check rerender plugin warning ([10f3f01](https://github.com/daskyrk/cube-state/commit/10f3f01))
* revert forceUpdate for not cover third position usage ([45eece6](https://github.com/daskyrk/cube-state/commit/45eece6))


### Features

* adjust forceUpdate to avoid why-did-you-render mistake check ([389a483](https://github.com/daskyrk/cube-state/commit/389a483))

### [1.1.3](https://github.com/daskyrk/cube-state/compare/v1.1.2...v1.1.3) (2020-06-03)

### [1.1.2](https://github.com/daskyrk/cube-state/compare/v1.1.1...v1.1.2) (2020-04-10)


### Bug Fixes

* restore support extra store property ([a9177cf](https://github.com/daskyrk/cube-state/commit/a9177cf))

### [1.1.1](https://github.com/daskyrk/cube-state/compare/v1.1.0...v1.1.1) (2020-04-09)


### Bug Fixes

* effects & reducers lost type after createStore ([85a7325](https://github.com/daskyrk/cube-state/commit/85a7325))

## [1.1.0](https://github.com/daskyrk/cube-state/compare/v1.0.7...v1.1.0) (2020-04-08)


### Features

* support extend store ([105e7e5](https://github.com/daskyrk/cube-state/commit/105e7e5))

### [1.0.7](https://github.com/daskyrk/cube-state/compare/v1.0.6...v1.0.7) (2020-04-07)


### Bug Fixes

* dev tool add required selector ([fa832f9](https://github.com/daskyrk/cube-state/commit/fa832f9))

### [1.0.6](https://github.com/daskyrk/cube-state/compare/v1.0.5...v1.0.6) (2020-04-04)

### [1.0.5](https://github.com/daskyrk/cube-state/compare/v1.0.4...v1.0.5) (2020-04-04)

### [1.0.4](https://github.com/daskyrk/cube-state/compare/v1.0.3...v1.0.4) (2020-04-04)


### Bug Fixes

* state maybe changed before mount ([0cd7d7f](https://github.com/daskyrk/cube-state/commit/0cd7d7f))

### [1.0.3](https://github.com/daskyrk/cube-state/compare/v1.0.2...v1.0.3) (2020-03-10)


### Bug Fixes

* loading plugin argument type and remove socket plugin ([c2d7997](https://github.com/daskyrk/cube-state/commit/c2d7997))

### [1.0.2](https://github.com/daskyrk/cube-state/compare/v1.0.1...v1.0.2) (2020-03-10)

### [1.0.1](https://github.com/daskyrk/cube-state/compare/v1.0.0...v1.0.1) (2020-03-10)


### Bug Fixes

* lost type define when use createFlatStore with loading plugin ([32c6533](https://github.com/daskyrk/cube-state/commit/32c6533))

## [1.0.0](https://github.com/daskyrk/cube-state/compare/v1.0.0-alpha...v1.0.0) (2020-03-04)


### Bug Fixes

* check name duplicate at first ([8d3645e](https://github.com/daskyrk/cube-state/commit/8d3645e))
* downgrade fast-deep-equal to v2 ([6ccb8cb](https://github.com/daskyrk/cube-state/commit/6ccb8cb))
* have inited check is useless here ([bb81c24](https://github.com/daskyrk/cube-state/commit/bb81c24))
* immer don't support circular object, restore pureChecker ([8df4c2a](https://github.com/daskyrk/cube-state/commit/8df4c2a))
* published package is empty ([fe0e73e](https://github.com/daskyrk/cube-state/commit/fe0e73e))


### Features

* add redux dev tools plugin ([e81f2b9](https://github.com/daskyrk/cube-state/commit/e81f2b9))
* effect update support beforeReducer and afterReducer ([f9b4994](https://github.com/daskyrk/cube-state/commit/f9b4994))
* support create flat store ([fbd98e9](https://github.com/daskyrk/cube-state/commit/fbd98e9))
* update loading plugin and docs ([1c0a59d](https://github.com/daskyrk/cube-state/commit/1c0a59d))
* update test sets ([2c5f3f8](https://github.com/daskyrk/cube-state/commit/2c5f3f8))

## [1.0.0-alpha](https://github.com/daskyrk/cube-state/compare/v0.2.10...v1.0.0-alpha) (2020-03-01)


### Features

* update build logic & test & plugin ([838a54b](https://github.com/daskyrk/cube-state/commit/838a54b))

### [0.2.10](https://github.com/daskyrk/cube-state/compare/v0.2.9...v0.2.10) (2020-02-24)


### Bug Fixes

* useStore return storeState instead of state ([4fbebeb](https://github.com/daskyrk/cube-state/commit/4fbebeb))

### [0.2.9](https://github.com/daskyrk/cube-state/compare/v0.2.8...v0.2.9) (2020-02-23)


### Bug Fixes

* accept more than 2 arguments in effect function ([c52acca](https://github.com/daskyrk/cube-state/commit/c52acca))

### [0.2.8](https://github.com/daskyrk/cube-state/compare/v0.2.7...v0.2.8) (2020-01-15)


### Bug Fixes

* update typing ([fe68775](https://github.com/daskyrk/cube-state/commit/fe68775))

### [0.2.7](https://github.com/daskyrk/cube-state/compare/v0.2.6...v0.2.7) (2020-01-15)

### [0.2.6](https://github.com/daskyrk/cube-state/compare/v0.2.5...v0.2.6) (2020-01-15)


### Features

* support useStore or getState without selector param ([44673cb](https://github.com/daskyrk/cube-state/commit/44673cb))

### [0.2.5](https://github.com/daskyrk/cube-state/compare/v0.2.4...v0.2.5) (2020-01-02)


### Features

* throw error after effect hooks ([9a871b0](https://github.com/daskyrk/cube-state/commit/9a871b0))

### [0.2.4](https://github.com/daskyrk/cube-state/compare/v0.2.3...v0.2.4) (2019-12-23)


### Features

* update count example ([1cd95e4](https://github.com/daskyrk/cube-state/commit/1cd95e4))

### [0.2.3](https://github.com/daskyrk/cube-state/compare/v0.2.2...v0.2.3) (2019-12-23)


### Bug Fixes

* initOption is optional ([74541df](https://github.com/daskyrk/cube-state/commit/74541df))

### [0.2.2](https://github.com/daskyrk/cube-state/compare/v0.2.1...v0.2.2) (2019-12-23)

### [0.2.1](https://github.com/daskyrk/cube-state/compare/v0.1.6...v0.2.1) (2019-12-23)


### Features

* update api ([72dcce4](https://github.com/daskyrk/cube-state/commit/72dcce4))

### [0.1.6](https://github.com/daskyrk/cube-state/compare/v0.1.5...v0.1.6) (2019-12-12)


### Bug Fixes

* rename missed typo ([1a7dcfb](https://github.com/daskyrk/cube-state/commit/1a7dcfb))


### Features

* rename and delete returned state for typing usage only ([a0089df](https://github.com/daskyrk/cube-state/commit/a0089df))

### [0.1.5](https://github.com/daskyrk/cube-state/compare/v0.1.4...v0.1.5) (2019-12-11)


### Bug Fixes

* merge custom effect when execute effect ([bca2bc0](https://github.com/daskyrk/cube-state/commit/bca2bc0))

### [0.1.4](https://github.com/daskyrk/cube-state/compare/v0.1.3...v0.1.4) (2019-12-10)


### Features

* add loading & socket plugin example ([1653de1](https://github.com/daskyrk/cube-state/commit/1653de1))
* support extend store ([115ee01](https://github.com/daskyrk/cube-state/commit/115ee01))

### [0.1.3](https://github.com/daskyrk/cube-state/compare/v0.1.2...v0.1.3) (2019-10-08)


### Features

* support pure reducer & update in effectMeta ([f0b829d](https://github.com/daskyrk/cube-state/commit/f0b829d))

### [0.1.2](https://github.com/daskyrk/cube-state/compare/v0.1.1...v0.1.2) (2019-10-07)


### Bug Fixes

* export typing incomplete ([f881293](https://github.com/daskyrk/cube-state/commit/f881293))


### Features

* update count example dependency ([9ffa737](https://github.com/daskyrk/cube-state/commit/9ffa737))

### 0.1.1 (2019-10-05)


### Bug Fixes

* disable change state directly ([66f3994](https://github.com/daskyrk/cube-state/commit/66f3994))


### Features

* add count example ([38741ff](https://github.com/daskyrk/cube-state/commit/38741ff))
