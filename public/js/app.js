const app = {
  selectors: {
    CLEAR_BTN: '#clearBtn',
    OUTPUT: '#endpointOutput',
  },

  /**
   * Initializes the app
   */
  init: function(){
    const _self = app;
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const fetchOpts = {
      headers: headers,
    };
    let url;

    // good get
    fetchOpts.method = 'GET';
    url = _self.addQueryParams(window.appData.endpoints.get.GET_IT +'/1234', {
      fu: 'test',
      bar: 'test2',
      internal: true,
    });
    fetch(url, fetchOpts)
      .then(_self.transformResp)
      .then(_self.handleSuccess.bind(_self))
      .catch(_self.handleError.bind(_self));

    // good post
    fetchOpts.method = 'POST';
    fetchOpts.body = JSON.stringify({
      fu: 'test',
      bar: 'test2',
      internal: true,
    });
    url = window.appData.endpoints.post.POST_IT;
    fetch(url, fetchOpts)
      .then(_self.transformResp)
      .then(_self.handleSuccess.bind(_self))
      .catch(_self.handleError.bind(_self));

    // bad post
    fetchOpts.method = 'POST';
    fetchOpts.body = JSON.stringify({
      fu: 'test',
      bad: true,
      internal: true,
    });
    url = window.appData.endpoints.post.POST_IT;
    fetch(url, fetchOpts)
      .then(_self.transformResp)
      .then(_self.handleSuccess.bind(_self))
      .catch(_self.handleError.bind(_self));


    // listen for external server requests
    window.socket.on('gotData', _self.handleSocketData.bind(_self));
    window.socket.on('postedData', _self.handleSocketData.bind(_self));


    document.querySelector(_self.selectors.CLEAR_BTN).addEventListener('click', () => {
      document.querySelector(_self.selectors.OUTPUT).innerHTML = '';
    });
  },

  /**
   * Converts an Object to a query string for requests.
   *
   * @param {String} url - The request URL
   * @param {Object} data - The data you want to send to the request
   * @return {String}
   */
  addQueryParams: function(url, data){
    var query = Object.keys(data)
      .map((k) => encodeURIComponent(k) +'='+ encodeURIComponent(data[k]))
      .join('&');

    return ( query !== '' ) ? url +'?'+ query : url;
  },

  /**
   * Removes some of the repetition of parsing route responses.
   *
   * @param {Object} resp - A request response
   * @return {Object|Error}
   */
  transformResp: function(resp){
    switch( resp.status ){
      case 200 :
        return resp.json();

      default :
        return resp.json()
          .then((data) => {
            var err = new Error(data.error);
            err.name = resp.status;
            throw err;
          });
    }
  },

  /**
   * The template for a request response.
   *
   * @param {Object} resp - A request response
   * @return {String}
   */
  cardTemplate: (resp) => `
    <div class="card is--${ resp.status }">
      <div class="card__body">${ resp.msg }</div>
    </div>
  `,

  /**
   * Handles a successful response.
   *
   * @param {Object} resp - A request response
   */
  handleSuccess: function(resp){
    console.log(resp.msg);

    document.querySelector(this.selectors.OUTPUT).innerHTML += this.cardTemplate(resp);
  },

  /**
   * Handles a failed response.
   *
   * @param {Object} err - An error
   */
  handleError: function(err){
    console.error(err.message);

    document.querySelector(this.selectors.OUTPUT).innerHTML += this.cardTemplate({
      msg: err.message,
      status: err.name,
    });
  },

  /**
   * Renders socket data.
   *
   * @param {Object} data - Data from the server
   */
  handleSocketData: function(data){
    console.log('[ SOCKET ]', data);

    switch( data.status ){
      case 200 : this.handleSuccess(data); break;
      default : this.handleError({
        message: data.msg,
        name: data.status,
      });
    }
  },
};

window.addEventListener('load', app.init);
