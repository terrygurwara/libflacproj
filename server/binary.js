var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');

var server = BinaryServer({port: 9000});
server.on('connection', function(client){
  client.on('stream', function(stream, meta){
    var file = fs.createWriteStream(meta.file);
    stream.pipe(file);
  }); 
});
