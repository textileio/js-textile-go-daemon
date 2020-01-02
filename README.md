# Textile daemon access from Node _(js-textile-go-daemon)_

[![Made by Textile](https://img.shields.io/badge/made%20by-Textile-informational.svg?style=popout-square)](https://textile.io)
[![Chat on Slack](https://img.shields.io/badge/slack-slack.textile.io-informational.svg?style=popout-square)](https://slack.textile.io)
[![Keywords](https://img.shields.io/github/package-json/keywords/textileio/js-textile-go-daemon.svg?style=popout-square)](./package.json)

[![GitHub package.json version](https://img.shields.io/github/package-json/v/textileio/js-textile-go-daemon.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@textile/go-daemon.svg?style=popout-square)](https://www.npmjs.com/package/@textile/go-daemon)
[![node (scoped)](https://img.shields.io/node/v/@textile/go-daemon.svg?style=popout-square)](https://www.npmjs.com/package/@textile/go-daemon)
[![GitHub license](https://img.shields.io/github/license/textileio/js-textile-go-daemon.svg?style=popout-square)](./LICENSE)
[![David](https://img.shields.io/david/dev/textileio/js-textile-go-daemon.svg)](https://david-dm.org/textileio/js-textile-go-daemon)
[![CircleCI branch](https://img.shields.io/circleci/project/github/textileio/js-textile-go-daemon/master.svg?style=popout-square)](https://circleci.com/gh/textileio/js-textile-go-daemon)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=popout-square)](https://github.com/RichardLitt/standard-readme)
[![docs](https://img.shields.io/badge/docs-master-success.svg?style=popout-square)](https://textileio.github.io/js-textile-go-daemon/)

---
**Deprecation Warning**

Textile Threads v1 are being deprecated. Please follow our ongoing work on v2 on both the [go-textile-threads repo](https://github.com/textileio/go-textile-threads) and the [early preview](https://paper.dropbox.com/doc/Threads-v2-Early-Preview-X8fKsMiTyztuQ1L8CnUng). 

Until Threads v2 release, this repo should be used for experimental purposes only.

---

> Spawn and control the Textile daemon from Node/Javascript

Join us on our [public Slack channel](https://slack.textile.io/) for news, discussions, and status updates.

## Table of Contents

- [Background](#background)
- [Usage](#usage)
- [Development](#development)
- [Documentation](#documentation)
- [Maintainer](#maintainer)
- [Contributing](#contributing)
- [License](#license)
- [About](#about)

## Background

[Textile](https://www.textile.io) provides encrypted, recoverable, schema-based, and cross-application data storage built on [IPFS](https://github.com/ipfs) and [libp2p](https://github.com/libp2p). We like to think of it as a decentralized data wallet with built-in protocols for sharing and recovery, or more simply, **an open and programmable iCloud**.

A daemon is a program that operates as a long-running 'background' process (without a terminal or user interface). In most cases, the daemon exposes a network API (usually HTTP / TCP) that allows other programs to interact with it while it's running. Most daemons ship with a command-line client for this API.

With Textile, all desktop and server peers run as a daemon, which contains an embedded IPFS node. Much like the IPFS daemon, the program (`textile`) ships with a command-line client. This package is designed to interface with the daemon's command-line client, from Javascript.

## Usage

You'll need to have a `go-textile` binary installed in order to be able to use this package to control it. You can install it manually according to [these instructions](https://docs.textile.io/install/the-daemon/), or install it via the [`@textile/go-textile-dep`](https://github.com/textileio/npm-go-textile-dep) package:

```bash
npm i @textile/go-textile-dep
```

See [`examples/node`](./examples/node) for a simple setup using `@textile/go-textile-dep`.

## Development

```sh
# Lint everything
# NOTE: Linting uses `prettier` to auto-fix styling issues when possible
npm run lint
```

You can also compile the Typescript yourself with:

```sh
npm run build
```

## Maintainer

[Carson Farmer](https://github.com/carsonfarmer)

## Contributing

This library is a work in progress. As such, there's a few things you can do right now to help out:

  * Ask questions! We'll try to help. Be sure to drop a note (on the above issue) if there is anything you'd like to work on and we'll update the issue to let others know. Also [get in touch](https://slack.textile.io) on Slack.
  * Log bugs, [file issues](https://github.com/textileio/js-textile-go-daemon/issues), submit pull requests!
  * **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
  * Take a look at [go-textile](https://github.com/textileio/go-textile). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.
  * **Contribute to the [Textile docs](https://github.com/textileio/docs)** with any additions or questions you have about Textile and its various implementations. A good example would be asking, "What is an Textile daemon". If you don't know a term, odds are someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make Textile even better.

 Before you get started, be sure to read our [contributors guide](./CONTRIBUTING.md) and our [contributor covenant code of conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE)

## About

This package was heavily inspired (it started as a direct fork) by the [`https://github.com/ipfs/js-ipfsd-ctl`](https://github.com/ipfs/https://github.com/ipfs/js-ipfsd-ctl) library. Big thanks to all the contributors to that original package! See `package.json`, `LICENSE`, and `CHANGELOG.md` in that project for details and contributions.
