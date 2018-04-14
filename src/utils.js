module.exports = {
  /**
   * Validates that only the allowed props for a route are passed. If not, it'll
   * display an error with what is allowed.
   *
   * @param {String|Array} allowed - The props that are allowed by the route.
   * @param {Object} data - The data that was passed to the route.
   * @return {Promise}
   */
  routePropCheck: function(allowed, data){
    return new Promise((res, rej) => {
      const keys = Object.keys(data);

      if( typeof allowed === 'string' ) allowed = allowed.split('|');

      if( keys.length ){
        for( let i=0; i<keys.length; i++ ){
          if( allowed.indexOf( keys[i] ) < 0 ){
            rej(new Error(`Allowed props are: '${ allowed.join("', '") }'`));
          }
        }

        res("All's good man");
      }else{
        rej(new Error('No data was passed'));
      }
    });
  },
};
