# Concurrify

[![Chat](https://badges.gitter.im/fluture-js/concurrify.svg)](https://gitter.im/fluture-js/fluture)
[![NPM Version](https://badge.fury.io/js/concurrify.svg)](https://www.npmjs.com/package/concurrify)
[![Dependencies](https://david-dm.org/fluture-js/concurrify.svg)](https://david-dm.org/fluture-js/concurrify)
[![Build Status](https://travis-ci.org/fluture-js/concurrify.svg?branch=master)](https://travis-ci.org/fluture-js/concurrify)
[![Code Coverage](https://codecov.io/gh/fluture-js/concurrify/branch/master/graph/badge.svg)](https://codecov.io/gh/fluture-js/concurrify)

Turn non-concurrent [FantasyLand 3][FL3] Applicatives concurrent.

Most time-dependent applicatives are very useful as Monads, because it
gives them the ability to run sequentially, where each step depends on the
previous. However, they lose the ability to run concurrently. This library
allows one to wrap a [`Monad`][FL:Monad] (with sequential `ap`) in an
[`Alternative`][FL:Alternative] (with parallel `ap`).

## Usage

```js
// The concurrify function takes four arguments, explained below.
const concurrify = require ('concurrify');

// The Type Representative of the Applicative we want to transform.
const Future = require ('fluture');

// A "zero" instance and an "alt" function for "Alternative".
const zero = Future (() => {});
const alt = Future.race;

// An override "ap" function that runs the Applicatives concurrently.
const ap = (mx, mf) => (Future.both (mx, mf)).map (([x, f]) => f (x));

// A new Type Representative created by concurrify.
const ConcurrentFuture = concurrify (Future, zero, alt, ap);

// We can use our type as such:
const par = ConcurrentFuture (Future.of (1));
const seq = par.sequential;
seq.fork (console.error, console.log);
```

## Interoperability

* Implements [FantasyLand 3][FL3] `Alternative`
  (`of`, `zero`, `map`, `ap`, `alt`).
* Instances can be identified by, and are compared using,
  [Sanctuary Type Identifiers][STI].
* Instances can be converted to String representations according to
  [Sanctuary Show][SS].

## API

#### <a name="concurrify" href="https://github.com/fluture-js/concurrify/blob/v1.1.1/index.js#L135">`concurrify :: (Applicative f, Alternative (m f)) => (TypeRep f, f a, (f a, f a) -⁠> f a, (f a, f (a -⁠> b)) -⁠> f b) -⁠> f c -⁠> m f c`</a>

[FL3]: https://github.com/fantasyland/fantasy-land/
[FL:Monad]: https://github.com/fantasyland/fantasy-land/#monad
[FL:Alternative]: https://github.com/fantasyland/fantasy-land/#alternative
[STI]: https://github.com/sanctuary-js/sanctuary-type-identifiers
[SS]: https://github.com/sanctuary-js/sanctuary-show
