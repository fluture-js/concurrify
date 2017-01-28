(function(global, f){

  'use strict';

  /*istanbul ignore next*/
  if(module && typeof module.exports !== 'undefined'){
    module.exports = f();
  }else{
    global.concurrify = f();
  }

}(/*istanbul ignore next*/(global || window || this), function(){

  'use strict';

  return function(){};

}));
