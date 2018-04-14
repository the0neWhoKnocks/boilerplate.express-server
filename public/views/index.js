/**
 * Builds out the Browser Sync script for dev mode.
 *
 * @param {Boolean} dev - Whether or not in dev mode.
 * @return {String}
 */
function browserSyncScript(dev){
  if( !dev ) return '';

  return `
    <script id="__bs_script__">
     document.write("<script async src='http://HOST:8082/browser-sync/browser-sync-client.js?v=2.18.7'><\\/script>".replace("HOST", location.hostname) );
    </script>
  `;
}

/**
 * A helper to loop over array items and return a CSS link or JS script.
 *
 * @param {Array} arr - Array of link or script URLs
 * @param {String} type - Type of URLS ['link', 'script']
 * @return {String}
 */
function each(arr, type){
  let template;

  switch(type){
    case 'link':
      template = '<link rel="stylesheet" type="text/css" href="{PATH}">';
      break;

    case 'script':
      template = '<script type="text/javascript" src="{PATH}"></script>';
      break;
  }

  return arr
    .map((filePath) => template.replace('{PATH}', filePath))
    .join("\n"); // eslint-disable-line quotes
}

module.exports = function(model){
  return `
    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <title>${ model.head.title }</title>
        ${ each(model.head.styles, 'link') }
        <script>
          window.appData = ${ JSON.stringify(model.appData) };
        </script>
      </head>
      <body>
        <nav class="top-nav">
          <button id="clearBtn" type="button" class="top-nav__btn">Clear</button>
        </nav>
        <div id="endpointOutput"></div>

        ${ each(model.body.scripts, 'script') }
        <script>
          var socket = io.connect('${ model.appURL }');

          socket.on('connect', function(data){
            console.log('[ SOCKET ] Connected');
          });
        </script>
        ${ browserSyncScript(model.dev) }
      </body>
    </html>
  `;
};
