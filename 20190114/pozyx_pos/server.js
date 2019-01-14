console.log("Server Started....");

var server = require('http').createServer(handler)
  , io = require('socket.io')(server)
  , fs = require('fs')

var tags = {};

server.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading HTML');
    }
    res.writeHead(200);
    res.end(data);
  });
} 


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
