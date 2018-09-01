//. # Concurrify
//.
//. [![Chat](https://badges.gitter.im/fluture-js/concurrify.svg)](https://gitter.im/fluture-js/fluture)
//. [![NPM Version](https://badge.fury.io/js/concurrify.svg)](https://www.npmjs.com/package/concurrify)
//. [![Dependencies](https://david-dm.org/fluture-js/concurrify.svg)](https://david-dm.org/fluture-js/concurrify)
//. [![Build Status](https://travis-ci.org/fluture-js/concurrify.svg?branch=master)](https://travis-ci.org/fluture-js/concurrify)
//. [![Code Coverage](https://codecov.io/gh/fluture-js/concurrify/branch/master/graph/badge.svg)](https://codecov.io/gh/fluture-js/concurrify)
//.
//. Turn non-concurrent [FantasyLand 3][FL3] Applicatives concurrent.
//.
//. Most time-dependent applicatives are very useful as Monads, because it
//. gives them the ability to run sequentially, where each step depends on the
//. previous. However, they lose the ability to run concurrently. This library
//. allows one to wrap a [`Monad`][FL:Monad] (with sequential `ap`) in an
//. [`Alternative`][FL:Alternative] (with parallel `ap`).
//.
//. ## Usage
//.
//. ```js
//. // The concurrify function takes four arguments, explained below.
//. const concurrify = require ('concurrify');
//.
//. // The Type Representative of the Applicative we want to transform.
//. const Future = require ('fluture');
//.
//. // A "zero" instance and an "alt" function for "Alternative".
//. const zero = Future (() => {});
//. const alt = Future.race;
//.
//. // An override "ap" function that runs the Applicatives concurrently.
//. const ap = (mx, mf) => (Future.both (mx, mf)).map (([x, f]) => f (x));
//.
//. // A new Type Representative created by concurrify.
//. const ConcurrentFuture = concurrify (Future, zero, alt, ap);
//.
//. // We can use our type as such:
//. const par = ConcurrentFuture (Future.of (1));
//. const seq = par.sequential;
//. seq.fork (console.error, console.log);
//. ```
//.
//. ## Interoperability
//.
//. * Implements [FantasyLand 3][FL3] `Alternative`
//.   (`of`, `zero`, `map`, `ap`, `alt`).
//. * Instances can be identified by, and are compared using,
//.   [Sanctuary Type Identifiers][STI].
//. * Instances can be converted to String representations according to
//.   [Sanctuary Show][SS].
//.
//. ## API
(function(f) {

  'use strict';

  /* istanbul ignore next */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f (
      require ('sanctuary-show'),
      require ('sanctuary-type-identifiers')
    );
  } else {
    self.concurrify = f (
      self.sanctuaryShow,
      self.sanctuaryTypeIdentifiers
    );
  }

} (function(show, type) {

  'use strict';

  var $alt = 'fantasy-land/alt';
  var $ap = 'fantasy-land/ap';
  var $map = 'fantasy-land/map';
  var $of = 'fantasy-land/of';
  var $zero = 'fantasy-land/zero';
  var $$type = '@@type';
  var $$show = '@@show';
  var ordinal = ['first', 'second', 'third', 'fourth', 'fifth'];

  //       isFunction :: Any -> Boolean
  function isFunction(f) {
    return typeof f === 'function';
  }

  //       isBinary :: Function -> Boolean
  function isBinary(f) {
    return f.length >= 2;
  }

  //       isApplicativeRepr :: TypeRepr -> Boolean
  function isApplicativeRepr(Repr) {
    return typeof Repr[$of] === 'function' &&
           typeof Repr[$of] ()[$ap] === 'function';
  }

  //       invalidArgument :: (String, Number, String, String) -> !Undefined
  function invalidArgument(it, at, expected, actual) {
    throw new TypeError (
      it
      + ' expects its '
      + ordinal[at]
      + ' argument to '
      + expected
      + '\n  Actual: '
      + show (actual)
    );
  }

  //       invalidContext :: (String, String, String) -> !Undefined
  function invalidContext(it, actual, an) {
    throw new TypeError (
      it
      + ' was invoked outside the context of a '
      + an
      + '. \n  Called on: '
      + show (actual)
    );
  }

  //       getTypeIdentifier :: TypeRepresentative -> String
  function getTypeIdentifier(Repr) {
    return Repr[$$type] || Repr.name || 'Anonymous';
  }

  //       generateTypeIdentifier :: String -> String
  function generateTypeIdentifier(identifier) {
    var o = type.parse (identifier);
    return (
      (o.namespace || 'concurrify') + '/Concurrent' + o.name + '@' + o.version
    );
  }

  //# concurrify :: (Applicative f, Alternative (m f)) => (TypeRep f, f a, (f a, f a) -> f a, (f a, f (a -> b)) -> f b) -> f c -> m f c
  return function concurrify(Repr, zero, alt, ap) {

    var INNERTYPE = getTypeIdentifier (Repr);
    var OUTERTYPE = generateTypeIdentifier (INNERTYPE);
    var INNERNAME = (type.parse (INNERTYPE)).name;
    var OUTERNAME = (type.parse (OUTERTYPE)).name;

    function Concurrently(sequential) {
      this.sequential = sequential;
    }

    function isInner(x) {
      return (
        (x instanceof Repr) ||
        (Boolean (x) && x.constructor === Repr) ||
        (type (x) === Repr[$$type])
      );
    }

    function isOuter(x) {
      return (
        (x instanceof Concurrently) ||
        (Boolean (x) && x.constructor === Concurrently) ||
        (type (x) === OUTERTYPE)
      );
    }

    function construct(x) {
      if (!isInner (x)) {
        invalidArgument (OUTERNAME, 0, 'be of type "' + INNERNAME + '"', x);
      }
      return new Concurrently (x);
    }

    if (!isApplicativeRepr (Repr)) {
      invalidArgument ('concurrify', 0, 'represent an Applicative', Repr);
    }

    if (!isInner (zero)) {
      invalidArgument
        ('concurrify', 1, 'be of type "' + INNERNAME + '"', zero);
    }

    if (!isFunction (alt)) {
      invalidArgument ('concurrify', 2, 'be a function', alt);
    }

    if (!isBinary (alt)) {
      invalidArgument ('concurrify', 2, 'be binary', alt);
    }

    if (!isFunction (ap)) {
      invalidArgument ('concurrify', 3, 'be a function', ap);
    }

    if (!isBinary (ap)) {
      invalidArgument ('concurrify', 3, 'be binary', ap);
    }

    var proto =
    Concurrently.prototype =
    construct.prototype = {constructor: construct};

    construct[$$type] = OUTERTYPE;

    var mzero = new Concurrently (zero);

    construct[$zero] = function Concurrently$zero() {
      return mzero;
    };

    construct[$of] = function Concurrently$of(value) {
      return new Concurrently (Repr[$of] (value));
    };

    proto[$map] = function Concurrently$map(mapper) {
      if (!isOuter (this)) {
        invalidContext (OUTERNAME + '#map', this, OUTERNAME);
      }

      if (!isFunction (mapper)) {
        invalidArgument (OUTERNAME + '#map', 0, 'be a function', mapper);
      }

      return new Concurrently (this.sequential[$map] (mapper));
    };

    proto[$ap] = function Concurrently$ap(m) {
      if (!isOuter (this)) {
        invalidContext (OUTERNAME + '#ap', this, OUTERNAME);
      }

      if (!isOuter (m)) {
        invalidArgument (OUTERNAME + '#ap', 0, 'be a ' + OUTERNAME, m);
      }

      return new Concurrently (ap (this.sequential, m.sequential));
    };

    proto[$alt] = function Concurrently$alt(m) {
      if (!isOuter (this)) {
        invalidContext (OUTERNAME + '#alt', this, OUTERNAME);
      }

      if (!isOuter (m)) {
        invalidArgument (OUTERNAME + '#alt', 0, 'be a ' + OUTERNAME, m);
      }

      return new Concurrently (alt (this.sequential, m.sequential));
    };

    proto[$$show] = function Concurrently$show() {
      return OUTERNAME + '(' + show (this.sequential) + ')';
    };

    proto.toString = function Concurrently$toString() {
      if (!isOuter (this)) {
        invalidContext (OUTERNAME + '#toString', this, OUTERNAME);
      }
      return this[$$show] ();
    };

    return construct;

  };

}));

//. [FL3]: https://github.com/fantasyland/fantasy-land/
//. [FL:Monad]: https://github.com/fantasyland/fantasy-land/#monad
//. [FL:Alternative]: https://github.com/fantasyland/fantasy-land/#alternative
//. [STI]: https://github.com/sanctuary-js/sanctuary-type-identifiers
//. [SS]: https://github.com/sanctuary-js/sanctuary-show
