# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.3](https://github.com/nuxt-community/svg-sprite-module/compare/v0.4.2...v0.4.3) (2019-10-18)


### Features

* expose file-loader publicPath ([88ee0e3](https://github.com/nuxt-community/svg-sprite-module/commit/88ee0e3))
* expose file-loader publicPath ([#93](https://github.com/nuxt-community/svg-sprite-module/issues/93)) ([a28f795](https://github.com/nuxt-community/svg-sprite-module/commit/a28f795))

### [0.4.2](https://github.com/nuxt-community/svg-sprite-module/compare/v0.4.1...v0.4.2) (2019-09-29)


### Features

* **publicPath:** configurable publicPath for svg icons ([2e24d2b](https://github.com/nuxt-community/svg-sprite-module/commit/2e24d2b))

### [0.4.1](https://github.com/nuxt-community/svg-sprite-module/compare/v0.4.0...v0.4.1) (2019-09-26)


### Bug Fixes

* Do not register hooks on start-mode ([03ec139](https://github.com/nuxt-community/svg-sprite-module/commit/03ec139))

### Features

* Introduce svgConfig option ([8016593](https://github.com/nuxt-community/svg-sprite-module/commit/8016593))

## [0.4.0](https://github.com/nuxt-community/svg-sprite-module/compare/v0.3.1...v0.4.0) (2019-09-04)


### Features

* Inline definitions, prevent id conflict ([2cfdd21](https://github.com/nuxt-community/svg-sprite-module/commit/2cfdd21))
* use functional component ([d0fdb25](https://github.com/nuxt-community/svg-sprite-module/commit/d0fdb25))

### [0.3.1](https://github.com/nuxt-community/svg-sprite-module/compare/v0.3.0...v0.3.1) (2019-09-02)


### Bug Fixes

* move class outside of attrs ([#79](https://github.com/nuxt-community/svg-sprite-module/issues/79)) ([103d7ce](https://github.com/nuxt-community/svg-sprite-module/commit/103d7ce))



## [0.3.0](https://github.com/nuxt-community/svg-sprite-module/compare/v0.2.1...v0.3.0) (2019-08-31)


### Bug Fixes

* remove url-loader && exclude output folder from svg loaders ([30ff18a](https://github.com/nuxt-community/svg-sprite-module/commit/30ff18a))


### Features

* add viewBox prop to plugin ([#27](https://github.com/nuxt-community/svg-sprite-module/issues/27)) ([5210218](https://github.com/nuxt-community/svg-sprite-module/commit/5210218))
* added viewBox prop to module ([7706e38](https://github.com/nuxt-community/svg-sprite-module/commit/7706e38))
* define global and sprite specific class ([c1c1711](https://github.com/nuxt-community/svg-sprite-module/commit/c1c1711))



## [0.2.1](https://github.com/nuxt-community/svg-sprite-module/compare/v0.2.0...v0.2.1) (2019-05-26)


### Bug Fixes

* support svg 2 href attribute ([f6c1e34](https://github.com/nuxt-community/svg-sprite-module/commit/f6c1e34)), closes [#17](https://github.com/nuxt-community/svg-sprite-module/issues/17)
* use PascalCase for component registration name ([f0bc974](https://github.com/nuxt-community/svg-sprite-module/commit/f0bc974))
* **module:** move module initialize to build:before hook ([4bb045a](https://github.com/nuxt-community/svg-sprite-module/commit/4bb045a)), closes [#24](https://github.com/nuxt-community/svg-sprite-module/issues/24)
* **srcDir:** fixes the icon regeneration bug  ([6931525](https://github.com/nuxt-community/svg-sprite-module/commit/6931525))
* **styles:** inline all styles on optimization phase ([569821c](https://github.com/nuxt-community/svg-sprite-module/commit/569821c)), closes [#19](https://github.com/nuxt-community/svg-sprite-module/issues/19)
* **windows-support:** moves the replace function ([80c0e33](https://github.com/nuxt-community/svg-sprite-module/commit/80c0e33))



# [0.2.0](https://github.com/nuxt-community/svg-sprite-module/compare/v0.1.0...v0.2.0) (2019-02-16)


### Bug Fixes

* **defs:** Extract defs from symbols ([7af91e5](https://github.com/nuxt-community/svg-sprite-module/commit/7af91e5)), closes [#4](https://github.com/nuxt-community/svg-sprite-module/issues/4)
* **svg-rule:** reduce url-loader byte limit [[#8](https://github.com/nuxt-community/svg-sprite-module/issues/8)] ([3b221fb](https://github.com/nuxt-community/svg-sprite-module/commit/3b221fb))


### Features

* **accessibility:** support for title and description in `svg-icon`[[#10](https://github.com/nuxt-community/svg-sprite-module/issues/10)] ([0119fae](https://github.com/nuxt-community/svg-sprite-module/commit/0119fae))
