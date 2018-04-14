const fs = require('fs');
const { resolve } = require('path');
const appConfig = require('../../conf.app');
const apiRoutes = require('./apiRoutes');

module.exports = {
  get: {
    ROOT: {
      path: '/',
      handler: ({ flags, indexTemplate, server }) => (req, res) => {
        // strip off Express params from endpoints for frontend
        const feEndpoints = {
          get: {},
          post: {},
        };

        Object.keys(apiRoutes).forEach(type => {
          Object.keys(apiRoutes[type]).forEach(ep => {
            feEndpoints[type][ep] = apiRoutes[type][ep].path.replace(/\/:\w+/g, '');
          });
        });

        // always get the freshest version of the manifest in dev
        const manifestPath = resolve(appConfig.paths.PUBLIC, './manifest.json');
        const manifest = ( flags.dev )
          ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
          : require(manifestPath);

        res.send(indexTemplate({
          appData: {
            endpoints: feEndpoints,
          },
          appURL: server.appURL,
          body: {
            scripts: [
              manifest['socket.io.js'],
              manifest['app.js'],
            ],
          },
          dev: flags.dev,
          head: {
            styles: [
              manifest['app.css'],
            ],
            title: appConfig.app.title,
          },
        }));
      },
    },
  },
};
