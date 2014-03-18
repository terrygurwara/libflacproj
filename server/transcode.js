function transcode(file) {
  var spawn = require('child_process').spawn

  var decode = spawn('flac', [
    '--decode',
    '--stdout',
    file
  ])

  var encode = spawn('lame', [
    '-V0',
    '-',
    '-'
  ])

  decode.stdout.pipe(encode.stdin)

  return encode
}

var express = require('express')
var app = express()


app.get('/testaudio.wav', function (req, res) {
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Range', 'bytes')
  res.setHeader('Content-Type', 'audio/flac')
  transcode(file).stdout.pipe(res)
})

io.sockets.on('connection', function(socket) {
  sessions.connect(socket.id);
  socket.transcode(file);
  socket.on('disconnect', function() { sessions.disconnect(socket.id); });
  socket.on('dial', function(data) { sessions.connect(socket.id);
    if (typeof data.phone !== "undefined" && data.phone !== "") {
      var phone = data.phone.replace(/\D/g,'');
      var msg = "ws dial: " + phone;
      $.console.magenta(msg);
      sessions[socket.id]['phone'] = phone;
    }
    if (typeof data.lang !== "undefined" && data.lang !== "") {
      var msg = "ws lang: " + data.lang;
      $.console.magenta(msg);
      sessions[socket.id]['lang'] = data.lang;
    } else sessions[socket.id]['lang'] = 'en-US';
  });
  socket.on('hangup', function(data) {
    if (typeof data.phone !== "undefined" && data.phone != "") {
      var phone = data.phone.replace(/\D/g,'');
      var msg = "ws hangup: " + phone;
      $.console.magenta(msg);
      if (sessions[socket.id]["phone"] == phone) {
        delete sessions[socket.id]['phone'];
        delete sessions[socket.id]['lang'];
      }
    }
  });
  
	createReadStream inputaudio = new createReadStream();
	createWriteStream outputaudio = new createWriteStream();
	transcode();
});

function sliceStream(start, writeStream, readStream) {
  var length = 0
  var passed = false

  readStream.on('data', function (buf) {
    if (passed) return writeStream.write(buf);

    length += buf.length

    if (length < start) return;

    passed = true
    writeStream.write(buf.slice(length - start))
  })

  readStream.on('end', function () {
    writeStream.end()
  })
}

var parseRange = require('range-parser')

app.get('/testaudio.wav', function (req, res) {
  var ranges = parseRange(Infinity, req.headers['range'])

  if (ranges === -1 || ranges === -2) return res.send(400);

  var start = ranges[0].start

  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Content-Type', 'audio/flac')

  if (!start) {
    res.setHeader('Content-Range', 'bytes')
    transcode(file).stdout.pipe(res)
    return
  }

  res.setHeader('Content-Range', 'bytes ' + start + '-')
  sliceStream(start, transcode(file).stdout, res)
})
