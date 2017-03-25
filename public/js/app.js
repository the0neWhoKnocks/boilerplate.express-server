var app = {
  selectors: {
    CLEAR_BTN: '#clearBtn',
    OUTPUT: '#endpointOutput'
  },
  
  init: function(){
    var _self = app;
    var headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    var fetchOpts = { 
      headers: headers
    };
    var url;
    
    // good get
    fetchOpts.method = 'GET';
    url = _self.addQueryParams(window.appData.endpoints.GET_IT +'/1234', {
      fu: 'test',
      bar: 'test2',
      internal: true
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
      internal: true
    });
    url = window.appData.endpoints.POST_IT;
    fetch(url, fetchOpts)
    .then(_self.transformResp)
    .then(_self.handleSuccess.bind(_self))
    .catch(_self.handleError.bind(_self));
    
    // bad post
    fetchOpts.method = 'POST';
    fetchOpts.body = JSON.stringify({
      fu: 'test',
      bad: true,
      internal: true
    });
    url = window.appData.endpoints.POST_IT;
    fetch(url, fetchOpts)
    .then(_self.transformResp)
    .then(_self.handleSuccess.bind(_self))
    .catch(_self.handleError.bind(_self));
    
    
    // listen for external server requests
    socket.on('gotData', _self.handleSocketData.bind(_self));
    socket.on('postedData', _self.handleSocketData.bind(_self));
    
    
    document.querySelector(_self.selectors.CLEAR_BTN).addEventListener('click', function(ev){
      document.querySelector(_self.selectors.OUTPUT).innerHTML = '';
    });
  },
  
  addQueryParams: function(url, data){
    var query = Object.keys(data)
    .map(function(k){
      return encodeURIComponent(k) +'='+ encodeURIComponent(data[k])
    })
    .join('&');
    
    return ( query !== '' ) ? url +'?'+ query : url;
  },

  transformResp: function(resp){
    switch( resp.status ){
      case 200 :
        return resp.json();
        break;
      
      default :
        return resp.json().then(function(data){
          var err = new Error(data.error);
          err.name = resp.status;
          throw err;
        });
    }
  },
  
  cardTemplate: function(ctx){
    markup  = '<div class="card is--'+ ctx.status +'">';
    markup +=   '<div class="card__body">'+ ctx.msg +'</div>';
    markup += '</div>';
    
    return markup;
  },
  
  handleSuccess: function(resp){
    console.log(resp.msg);
    
    document.querySelector(this.selectors.OUTPUT).innerHTML += this.cardTemplate(resp);
  },

  handleError: function(err){
    console.error(err.message);
    
    document.querySelector(this.selectors.OUTPUT).innerHTML += this.cardTemplate({
      msg: err.message,
      status: err.name
    });
  },
  
  handleSocketData: function(data){
    console.log('[ SOCKET ]', data);
    
    switch( data.status ){
      case 200 : this.handleSuccess(data); break;
      default : this.handleError({
        message: data.msg,
        name: data.status
      });
    }
  }
};

window.addEventListener('load', app.init);