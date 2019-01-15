console.log("Server Started....");

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs')

server.listen(8080);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

var tags = {};
var wsclients = {};
var wsclientid = 0;

const mqtt = require('mqtt');

const TOPIC = 'tags';
const client = mqtt.connect('mqtt://192.168.88.48:1883');

client.subscribe(TOPIC);
client.on('message', (topic, message) => {
  //console.info(message.toString());
  const _message = JSON.parse(message.toString());
  if (_message[0].tagId === '26478') {
    if(_message[0].data === undefined) return;
    console.log(_message[0]);
    if(typeof _message[0].data.coordinates !== "undefined") {
      tags[_message[0].tagId] = _message[0].data;
      if (wsclients['26478'])
        wsclients['26478'].emit('pozyx_pos',tags);
    }
  }
});


io.on('connection', function (client) {
  //console.log(client);
  client.on('disconnect', function() {});
  wsclients['26478'] = client;
}); 
