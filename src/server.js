const path = require('path');
const express = require('express');
const color = require('cli-color');
const browserSync = require('browser-sync');
const io = require('socket.io');
const opn = require('opn');
const portscanner = require('portscanner');
const yargs = require('yargs');
const bodyParser = require('body-parser');

const appConfig = require('../conf.app.js');
const indexTemplate = require('../public/views/index.js');
const apiRoutes = require('./routes/apiRoutes.js');
const serverRoutes = require('./routes/serverRoutes.js');

// =============================================================================

yargs
  .option('d', {
    alias: 'dev',
    desc: 'Runs the server in Dev mode',
    type: 'boolean',
  })
  .option('c', {
    alias: 'cmd',
    choices: ['init'],
    desc: 'What function to run on the server (only CLI)',
  })
  .help()
  .argv;

const flags = yargs.parse();

// =============================================================================

const OS = function(){
  const platform = process.platform;

  if( /^win/.test(platform) ) return 'WINDOWS';
  else if( /^darwin/.test(platform) ) return 'OSX';
  else if( /^linux/.test(platform) ) return 'LINUX';
  else return platform;
}();
const CHROME = function(){
  switch(OS){
    case 'WINDOWS': return 'chrome';
    case 'OSX': return 'google chrome';
    case 'LINUX': return 'google-chrome';
  }
}();
const app = {
  /**
   * Initializes the server
   */
  init: function(){
    this.expressInst = express();
    this.server = require('http').createServer(this.expressInst);
    // doc root is `public`
    this.expressInst.use(express.static(appConfig.paths.PUBLIC));
    // allows for reading POST data
    this.expressInst.use(bodyParser.json()); // to support JSON-encoded bodies
    this.expressInst.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true,
    }));

    // setup socket so external requests show up in the client
    this.io = io(this.server);

    // bind server routes
    this.setupRoutes();
    this.obtainPort();
  },

  /**
   * Adds in all the routes the server accepts.
   */
  setupRoutes: function(){
    const _self = this;

    this.expressInst.get(
      serverRoutes.get.ROOT.path,
      serverRoutes.get.ROOT.handler({
        flags,
        indexTemplate,
        server: _self,
      })
    );

    // dynamically wire up API routes
    Object.keys(apiRoutes).forEach(type => {
      Object.keys(apiRoutes[type]).forEach(routeKey => {
        const ep = apiRoutes[type][routeKey];
        _self.expressInst[type](ep.path, ep.handler({
          server: _self,
        }));
      });
    });
  },

  /**
   * Obtains an available port and starts the server.
   */
  obtainPort: function(){
    const _self = this;

    // Dynamically sets an open port, if the default is in use.
    portscanner.checkPortStatus(appConfig.PORT, '127.0.0.1', (error, status) => {
      // Status is 'open' if currently in use or 'closed' if available
      switch(status){
        case 'open' : // port isn't available, so find one that is
          portscanner.findAPortNotInUse(appConfig.PORT, appConfig.PORT+20, '127.0.0.1', (error, openPort) => {
            console.log(`${ color.yellow.bold.inverse(' PORT ') } ${ appConfig.PORT } in use, using ${ openPort }`);

            appConfig.PORT = openPort;

            _self.startServer();
          });
          break;

        default :
          _self.startServer();
      }
    });
  },

  /**
   * Opens the browser and points to the server's assigned address.
   *
   * @param {Object} data - Data about the server instance.
   */
  openBrowser: function(data){
    // let the user know the server is up and ready
    let msg = `${ color.green.bold.inverse(' SERVER ') } Running at ${ color.blue.bold(data.url) }`;

    if( flags.dev ) msg += `\n${ color.green.bold.inverse(' WATCHING ') } For changes`;

    console.log(`${ msg } \n`);

    opn(data.url, {
      app: [CHROME, '--incognito'],
      wait: false, // no need to wait for app to close
    });
  },

  /**
   * Starts the server on the obtained port and sets up the file watcher when in
   * dev mode.
   */
  startServer: function(){
    const _self = this;

    this.server.listen(appConfig.PORT, () => {
      _self.appURL = 'http://localhost:'+ appConfig.PORT +'/';
      const serverData = {
        url: _self.appURL,
      };

      if( flags.dev ){
        browserSync.init({
          browser: CHROME,
          files: [ // watch these files
            appConfig.paths.PUBLIC,
          ],
          logLevel: 'silent', // prevent snippet message
          notify: false, // don't show the BS message in the browser
          port: appConfig.PORT,
          url: _self.appURL,
        }, _self.openBrowser.bind(_self, serverData));
      }else{
        _self.openBrowser(serverData);
      }
    });
  },
};

module.exports = app;
// CLI won't have parent
if( !module.parent && flags.cmd ){
  if( app[flags.cmd] ) app[flags.cmd]();
}
