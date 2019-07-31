# Test Electron Project

> A bare minimum project structure to get started embedding `go-textile` in an electron desktop application. Based on [`electron-webpack-quick-start`](https://github.com/electron-userland/electron-webpack-quick-start).

## About

In this example, a `go-textile` binary is embedded in an Electron app via `-c.asarUnpack=**/node_modules/@textile/go-textile-dep/**/*`, which 'unpacks' the `@textile/go-textile-dep` package within `node_modules` in the Electron bundle. The example app simply 'spins up' a new, ephemeral Textile node each time the button is pressed, appending the new peer's profile information to the page.

## Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```
