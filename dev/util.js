var Q = require('q');

module.exports = {
  endpointPropCheck: function(allowed, data){
    var deferred = Q.defer();
    var keys = Object.keys(data);
    
    if( typeof allowed === 'string' ) allowed = allowed.split('|');
    
    if( keys.length ){
      for( var i=0; i<keys.length; i++ ){
        if( allowed.indexOf( keys[i] ) === -1 ){
          deferred.reject(new Error(`Allowed props are: '${ allowed.join("', '") }'`));
        }
      }
      
      deferred.resolve("All's good man");
    }else{
      deferred.reject(new Error(`No data was passed`));
    }    
    
    return deferred.promise;
  }
};