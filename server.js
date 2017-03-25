var path = require('path');
var express = require('express');
var io = require('socket.io');
var color = require('cli-color');
var browserSync = require('browser-sync');
var opn = require('opn');
var portscanner = require('portscanner');
var flags = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');

var appConfig = require('./conf.app.js');
var endpoints = require('./dev/endpoints.js');
var util = require('./dev/util.js');
var indexTemplate = require('./public/views/index.js');

// =============================================================================

for(var key in flags){
  var val = flags[key];
  
  switch(key){
    case 'd' :
    case 'dev' :
      flags.dev = true;
      break;
  }
};


// =============================================================================

var OS = function(){
  var platform = process.platform;
  
  if( /^win/.test(platform) ) return 'WINDOWS';
  else if( /^darwin/.test(platform) ) return 'OSX';
  else if( /^linux/.test(platform) ) return 'LINUX';
  else return platform;
}();
var CHROME = function(){
  switch(OS){
    case 'WINDOWS': return 'chrome';
    case 'OSX': return 'google chrome';
    case 'LINUX': return 'google-chrome';
  }
}();
var app = {
  init: function(){
    this.expressInst = express();
    this.server = require('http').createServer(this.expressInst);
    // doc root is `public`
    this.expressInst.use(express.static(appConfig.paths.PUBLIC));
    // allows for reading POST data
    this.expressInst.use(bodyParser.json());   // to support JSON-encoded bodies
    this.expressInst.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true
    }));
    
    // setup socket so external requests show up in the client
    io = io(this.server);
    
    // bind server routes
    this.setupRoutes();
    this.addServerListeners();
  },
  
  setupRoutes: function(){
    var _self = this;
    
    this.expressInst.get('/', function(req, res){
      // strip off Express params from endpoints for frontend
      var feEndpoints = {};
      Object.keys(endpoints).map(function(key){
        feEndpoints[key] = endpoints[key].replace(/\/:\w+/g, '');
      });
      
      res.send(indexTemplate({
        appData: {
          endpoints: feEndpoints
        },
        appURL: _self.appURL,
        dev: flags.dev
      }));
    });
    
    this.expressInst.get(endpoints.GET_IT, function(req, res){
      var msg = `Got data for - ID: ${req.params.id} | Query: ${ JSON.stringify(req.query, null, 2) }`;
      var respData = { 
        msg: msg,
        status: 200
      };
      
      console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );
      
      if( !req.query.internal ) io.sockets.emit('gotData', respData);
      
      res.json(respData);
    });
    
    this.expressInst.post(endpoints.POST_IT, function(req, res){
      var data = req.body;
      var msg, respData;
      
      if( data ){
        var accepted = 'fu|bar|internal';
        
        util.endpointPropCheck(accepted, data)
          .then(function(){
            msg = `Posted data: ${ JSON.stringify(data, null, 2) }`;
            respData = { 
              msg: msg,
              status: 200
            };
            
            console.log( `${color.green.bold('[ SUCCESS ]')} ${msg}` );
            
            if( !data.internal ) io.sockets.emit('postedData', respData);
            
            res.json(respData);
          })
          .catch(function(err){
            msg = err.message;
            respData = { 
              msg: msg,
              status: 500
            };
        
            console.log( `${color.red.bold('[ ERROR ]')} ${msg}` );
            
            if( !data.internal ) io.sockets.emit('postedData', respData);
            
            res.status(respData.status);
            res.send({ error: respData.msg });
          });
      }else{
        msg = 'No data passed';
        respData = { 
          msg: msg,
          status: 500
        };
        
        console.log( `${color.red.bold('[ ERROR ]')} ${msg}` );
        
        if( !data.internal ) io.sockets.emit('postedData', respData);
        
        res.status(respData.status);
        res.send({ error: respData.msg });
      }
    });
  },
  
  addServerListeners: function(){
    var _self = this;
    
    // Dynamically sets an open port, if the default is in use.
    portscanner.checkPortStatus(appConfig.PORT, '127.0.0.1', function(error, status){
      // Status is 'open' if currently in use or 'closed' if available
      switch(status){
        case 'open' : // port isn't available, so find one that is
          portscanner.findAPortNotInUse(appConfig.PORT, appConfig.PORT+20, '127.0.0.1', function(error, openPort){
            console.log(`${color.yellow.bold('[PORT]')} ${appConfig.PORT} in use, using ${openPort}`);

            appConfig.PORT = openPort;
            
            _self.startServer();
          });
          break;
        
        default :
          _self.startServer();
      }
    });
  },
  
  openBrowser: function(data){
    // let the user know the server is up and ready
    var msg = `${color.green.bold('[ SERVER ]')} Running at ${color.blue.bold(data.url)}`;
    if( flags.dev ) msg += `\n${color.green.bold('[ WATCHING ]')} For changes`;
    console.log(`${msg} \n`);
    
    opn(data.url, {
      app: [CHROME, '--incognito'],
      wait: false // no need to wait for app to close
    });
  },
  
  startServer: function(){
    var _self = this;
    
    this.server.listen(appConfig.PORT, function(){  
      _self.appURL = 'http://localhost:'+ appConfig.PORT +'/';
      
      browserSync.init({
        browser: CHROME,
        files: [ // watch these files
          appConfig.paths.PUBLIC
        ],
        logLevel: 'silent', // prevent snippet message
        notify: false, // don't show the BS message in the browser
        port: appConfig.PORT,
        url: _self.appURL
      }, _self.openBrowser.bind(_self, {
        url: _self.appURL
      }));
    });
  }
};

module.exports = app;
var args = process.argv;
if( 
  // CLI won't have parent
  !module.parent
  // First arg is node executable, second arg is the .js file, the rest are user args
  && args.length >= 3
){
  if( app[args[2]] ) app[args[2]]();
}