(function(global, f){

  'use strict';

  /*istanbul ignore next*/
  if(module && typeof module.exports !== 'undefined'){
    module.exports = f(require('sanctuary-type-classes'), require('sanctuary-type-identifiers'));
  }else{
    global.concurrify = f(global.sanctuaryTypeClasses, global.sanctuaryTypeIdentifiers);
  }

}(/*istanbul ignore next*/(global || window || this), function(Z, type){

  'use strict';

  var $alt = 'fantasy-land/alt';
  var $ap = 'fantasy-land/ap';
  var $map = 'fantasy-land/map';
  var $of = 'fantasy-land/of';
  var $zero = 'fantasy-land/zero';
  var $$type = '@@type';

  var ordinal = ['first', 'second', 'third', 'fourth', 'fifth'];

  function isFunction(f){
    return typeof f === 'function';
  }

  function isBinary(f){
    return f.length >= 2;
  }

  function isApplicativeRepr(Repr){
    try{
      return Z.Applicative.test(Z.of(Repr));
    }catch(_){
      return false;
    }
  }

  function invalidArgument(it, at, expected, actual){
    throw new TypeError(
      it
      + ' expects its '
      + ordinal[at]
      + ' argument to '
      + expected
      + '\n  Actual: '
      + Z.toString(actual)
    );
  }

  function invalidContext(it, actual, an){
    throw new TypeError(
      it + ' was invoked outside the context of a ' + an + '. \n  Called on: ' + Z.toString(actual)
    );
  }

  function last(xs){
    return xs[xs.length - 1];
  }

  function getReprType(Repr){
    return Repr[$$type] || Repr.name || 'Anonymous';
  }

  function concurrentPrepender(x, i, xs){
    return i === xs.length - 1 ? ('Concurrent' + x) : x;
  }

  function computeType(type){
    return type.split('/').map(concurrentPrepender).join('/');
  }

  //concurrify :: Applicative m
  //           => (TypeRep m, m a, (m a, m a) -> m a, (m a, m (a -> b)) -> m b)
  //           -> Concurrently m
  return function concurrify(Repr, zero, alt, ap){

    var INNERTYPE = getReprType(Repr);
    var OUTERTYPE = computeType(INNERTYPE);

    function Concurrently(sequential){
      this.sequential = sequential;
    }

    function isInner(x){
      return x instanceof Repr
      || (Boolean(x) && x.constructor === Repr)
      || type(x) === Repr[$$type];
    }

    function isOuter(x){
      return x instanceof Concurrently
      || (Boolean(x) && x.constructor === Concurrently)
      || type(x) === OUTERTYPE;
    }

    function construct(x){
      if(!isInner(x)) invalidArgument(OUTERTYPE, 0, 'be of type "' + INNERTYPE + '"', x);
      return new Concurrently(x);
    }

    if(!isApplicativeRepr(Repr)) invalidArgument('concurrify', 0, 'represent an Applicative', Repr);
    if(!isInner(zero)) invalidArgument('concurrify', 1, 'be of type "' + INNERTYPE + '"', zero);
    if(!isFunction(alt)) invalidArgument('concurrify', 2, 'be a function', alt);
    if(!isBinary(alt)) invalidArgument('concurrify', 2, 'be binary', alt);
    if(!isFunction(ap)) invalidArgument('concurrify', 3, 'be a function', ap);
    if(!isBinary(ap)) invalidArgument('concurrify', 3, 'be binary', ap);

    var proto = Concurrently.prototype = construct.prototype = {constructor: construct};

    construct[$$type] = OUTERTYPE;

    var mzero = new Concurrently(zero);
    construct[$zero] = function Concurrently$zero(){
      return mzero;
    };

    construct[$of] = function Concurrently$of(value){
      return new Concurrently(Z.of(Repr, value));
    };

    proto[$map] = function Concurrently$map(mapper){
      if(!isOuter(this)) invalidContext(OUTERTYPE + '#map', this, OUTERTYPE);
      if(!isFunction(mapper)) invalidArgument(OUTERTYPE + '#map', 0, 'be a function', mapper);
      return new Concurrently(Z.map(mapper, this.sequential));
    };

    proto[$ap] = function Concurrently$ap(m){
      if(!isOuter(this)) invalidContext(OUTERTYPE + '#ap', this, OUTERTYPE);
      if(!isOuter(m)) invalidArgument(OUTERTYPE + '#ap', 0, 'be a Concurrently', m);
      return new Concurrently(ap(this.sequential, m.sequential));
    };

    proto[$alt] = function Concurrently$alt(m){
      if(!isOuter(this)) invalidContext(OUTERTYPE + '#alt', this, OUTERTYPE);
      if(!isOuter(m)) invalidArgument(OUTERTYPE + '#alt', 0, 'be a Concurrently', m);
      return new Concurrently(alt(this.sequential, m.sequential));
    };

    proto.toString = function Concurrently$toString(){
      if(!isOuter(this)) invalidContext(OUTERTYPE + '#toString', this, OUTERTYPE);
      return last(OUTERTYPE.split('/')) + '(' + Z.toString(this.sequential) + ')';
    };

    return construct;

  };

}));
