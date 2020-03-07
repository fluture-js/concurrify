# Concurrify

## :warning: Unmaintained

This library is no longer used by Fluture ([`7b6d9fd`][]), and now fills a
space I don't think is worth filling.

1. It's overly opinionated as a result of having been part of Fluture.
2. It does more than strictly necessary (inclusion of Alternative instance).
3. It doesn't do any real work - it just takes all the needed functions as
   input and wires them up for Fantasy Land compliance. As such, it's not
   a lot of effort for users to do the wiring themselves.
4. It used undocumented features from [Sanctuary Type Identifiers][STI] to
   automatically generate new type identifiers, but these are no longer
   available in the latest version of Sanctuary Type Identifiers.

[`7b6d9fd`]: https://github.com/fluture-js/Fluture/commit/7b6d9fdc4ebbc4c6c2485cb5a8d1b2da1eb39fe4
----

## Introduction

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

#### <a name="concurrify" href="https://github.com/fluture-js/concurrify/blob/v2.0.0/index.js#L135">`concurrify :: (Applicative f, Alternative (m f)) => (TypeRep f, f a, (f a, f a) -⁠> f a, (f a, f (a -⁠> b)) -⁠> f b) -⁠> f c -⁠> m f c`</a>

[FL3]: https://github.com/fantasyland/fantasy-land/
[FL:Monad]: https://github.com/fantasyland/fantasy-land/#monad
[FL:Alternative]: https://github.com/fantasyland/fantasy-land/#alternative
[STI]: https://github.com/sanctuary-js/sanctuary-type-identifiers
[SS]: https://github.com/sanctuary-js/sanctuary-show
