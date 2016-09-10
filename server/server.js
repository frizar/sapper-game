'use strict';

const http = require('http');
const nodeStatic = require('node-static');
const file = new nodeStatic.Server('.', {
    cache: 0
});
const port = 8080;

const accept = (req, res) => {
    if (!req.url.startsWith('/node_modules/')) {
        req.url = '/public' + req.url;
    }
    file.serve(req, res);
};

http.createServer(accept).listen(port);

console.info(`Server running on port ${port}`);
