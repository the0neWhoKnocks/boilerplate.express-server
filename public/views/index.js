function browserSyncScript(dev){
  if( !dev ) return '';
  
  return `
    <script id="__bs_script__">
      document.write("<script async src='http://HOST:8082/browser-sync/browser-sync-client.js?v=2.18.7'><\\/script>".replace("HOST", location.hostname) );
    </script>
  `;
}

module.exports = function(model){
  return `
    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <title>Express Server</title>
        <link rel="stylesheet" type="text/css" href="/css/app.css">
        <script>
          window.appData = ${ JSON.stringify(model.appData) };
        </script>
      </head>
      <body>
        <nav class="top-nav">
          <button id="clearBtn" type="button" class="top-nav__btn">Clear</button>
        </nav>
        <div id="endpointOutput"></div>
        
        <script language="javascript" type="text/javascript" src="/js/app.js"></script>
        <script language="javascript" type="text/javascript" src="/js/vendor/socket.io.min.js"></script>
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