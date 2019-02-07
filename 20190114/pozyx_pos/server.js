console.log("Server Started....");

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs')

server.listen(8000);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

var tags = {};
var wsclient;

const mqtt = require('mqtt');

const TOPIC = 'tags';
// const client = mqtt.connect('mqtt://192.168.88.48:1883');
const client = mqtt.connect('mqtt://localhost:1883');

client.subscribe(TOPIC);
client.on('message', (topic, message) => {
  const _message = JSON.parse(message.toString());
  console.log(message.toString());
  if (_message[0].tagId === '26478') {
    if(_message[0].data === undefined) return;
    // console.log(_message[0]);
    if(typeof _message[0].data.coordinates !== "undefined") {
      tags[_message[0].tagId] = _message[0].data;
      if (wsclient)
        wsclient.emit('pozyx_pos',tags);
    }
  }

  if (_message[0].tagId === '26394') {
    if(_message[0].data === undefined) return;
    // console.log(_message[0]);
    if(typeof _message[0].data.coordinates !== "undefined") {
      tags[_message[0].tagId] = _message[0].data;
      if (wsclient)
        wsclient.emit('pozyx_pos',tags);
    }
  }
});

io.on('connection', function (client) {
  client.on('disconnect', function() {});
  wsclient = client;
});
