var radio = require("radio-stream");
var http = require('http');
var url = "http://air.radiorecord.ru:8100/rr_aac?type=.mp3﻿";
var stream = radio.createReadStream(url);

var clients = [];

stream.on("connect", function() {
  console.error("Radio Stream connected!");
  console.error(stream.headers);
});


// When a chunk of data is received on the stream, push it to all connected clients
stream.on("data", function (chunk) {
    if (clients.length > 0){
        for (client in clients){
            clients[client].write(chunk);
        };
    }
});

// When a 'metadata' event happens, usually a new song is starting.
stream.on("metadata", function(title) {
  console.error(title);
});

// Listen on a web port and respond with a chunked response header. 
var server = http.createServer(function(req, res){ 
    res.writeHead(200,{
        "Content-Type": "audio/mpeg",
        'Transfer-Encoding': 'chunked'
    });
    // Add the response to the clients array to receive streaming
    clients.push(res);
    console.log('Client connected; streaming'); 
});
server.listen("8000", "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000'); 
