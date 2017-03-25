#!/bin/bash

# adds vendor assets from installed modules
echo "[ COPYING ] vendor resources"

mkdir -p "./public/js/vendor"

cp -v "./node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js" "./public/js/vendor/"

echo -e "\n[ COPY ] complete"
