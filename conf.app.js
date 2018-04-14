const { resolve } = require('path');

const ROOT = resolve(__dirname, './');

module.exports = {
  PORT: 8081,
  app: {
    title: 'Server Boilerplate',
  },
  paths: {
    PUBLIC: resolve(ROOT, './public'),
    ROOT,
  },
};
