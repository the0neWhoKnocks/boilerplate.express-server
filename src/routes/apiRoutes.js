const color = require('cli-color');
const { routePropCheck } = require('../utils.js');

module.exports = {
  get: {
    GET_IT: {
      path: '/api/v1/get/it/:id',
      handler: ({ server }) => (req, res) => {
        const msg = `Got data for - ID: ${ req.params.id } | Query: ${ JSON.stringify(req.query, null, 2) }`;
        const respData = {
          msg: msg,
          status: 200,
        };

        console.log( `${ color.green.bold.inverse(' SUCCESS ') } ${ msg }` );

        if( !req.query.internal ) server.io.sockets.emit('gotData', respData);

        res.json(respData);
      },
    },
  },
  post: {
    POST_IT: {
      path: '/api/v1/post/it',
      handler: ({ server }) => (req, res) => {
        const data = req.body;
        let msg, respData;

        if( data ){
          const accepted = 'fu|bar|internal';

          routePropCheck(accepted, data)
            .then(() => {
              msg = `Posted data: ${ JSON.stringify(data, null, 2) }`;
              respData = {
                msg: msg,
                status: 200,
              };

              console.log( `${ color.green.bold.inverse(' SUCCESS ') } ${ msg }` );

              if( !data.internal ) server.io.sockets.emit('postedData', respData);

              res.json(respData);
            })
            .catch((err) => {
              msg = err.message;
              respData = {
                msg: msg,
                status: 500,
              };

              console.log( `${ color.red.bold.inverse(' ERROR ') } ${ msg }` );

              if( !data.internal ) server.io.sockets.emit('postedData', respData);

              res.status(respData.status);
              res.send({ error: respData.msg });
            });
        }else{
          msg = 'No data passed';
          respData = {
            msg: msg,
            status: 500,
          };

          console.log( `${ color.red.bold.inverse(' ERROR ') } ${ msg }` );

          if( !data.internal ) server.io.sockets.emit('postedData', respData);

          res.status(respData.status);
          res.send({ error: respData.msg });
        }
      },
    },
  },
};
