var path = require('path');

module.exports = {
  PORT: 8081,
  paths: {
    ROOT: path.resolve(`${__dirname}/`),
    PUBLIC: path.resolve(`${__dirname}/public`)
  }
};