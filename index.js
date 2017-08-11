const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var timer = require('nano-timer');
var https = require("https");

app.use(express.static(__dirname + '/public'));

var clients = [];
var services = {};

function onConnection(socket) {
    console.info('New User connected (id=' + socket.id + ').');
    clients.push(socket);

    // Direct messages
    socket.on('room', function(room) {
        socket.join(room);
    });

    // Services
    socket.on('ServiceRequest', function(data) {
        console.log("OnService broadcast!!", data);

        // get associates
      //  var associates = [];
      //  var assoData = data.associates;
      //  for (var i = 0; i < assoData.length; i++) {
      //      console.log("Data: ", assoData[i]);
      //      associates.push(assoData[i].idAssociated);
      //  }

        services[data.transaction.idTransaction] = data.associates;

        console.log("Associates: ", services[data.transaction.idTransaction]);

        socket.broadcast.emit('ServiceAvailable', data);

        setTimeout(function() {
            var remainAsso = services[data.transaction.idTransaction];
            console.log("Remaining Associated: ", remainAsso);

            if (remainAsso) {
                console.log("Send notifications to: " + remainAsso.length);
                for (var j = 0; j < remainAsso.length; j++) {
                 console.log("Send notification for : " + remainAsso[j]);

                 data.transaction["idAssociated"] = remainAsso[j];
                 data.transaction["idSalon"] = 0;

                 var paramsPush = {
                  "token": remainAsso[j].token,
                  "message": "Tienes una nueva petición de servicio.",
                  "extra": data.transaction
                 };

                 sendNotification(paramsPush, function(){
                  console.log("Notification sent..");
                 });
                }
            }
        }, 10000);

        socket.emit("RequestAccepted");

    });

    socket.on("ServiceReceived", function(payload) {
        var transaction = payload.transaction;
        var associated = payload.associated;

        console.log("Service received by", associated);

        var array = services[transaction];
        var index = array.find(a => a.idAssociated === associated);

        array.splice(index, 1);
        services[transaction] = array;
    });

    socket.on("AcceptService", function(payload) {

        console.log("Is service still available?", services[payload.service] == false);

        if (services[payload.service] === false) {
            console.log("Service accepted !!", payload);
            services[payload.service] = true;
            io.sockets.in(payload.user).emit('AcceptService', 'it´s yours`');
        } else {
            io.sockets.in(payload.user).emit('AcceptService', 'sorry!');
        }

    });

    // Users
    socket.on('LoginGlker', function(data1) {
        console.log('New glker connected : ' + data1);
    });

    socket.on('LogoutGlker', function(data) {
        console.log('Adios' + data);
    });

    socket.on('disconnect', function(data) {

        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.info('Client gone (id=' + socket.id + ').');
        }
    });
};

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));


// Services AWS

var request = function() {

};


var sendNotification = function(paramsPush, callback) {
 var options = {
  "method": "POST",
  "hostname": "bs3pk23puh.execute-api.us-east-1.amazonaws.com",
  "port": null,
  "path": "/prod/Common/pushNotification",
  "headers": {
   "content-type": "application/json",
   "cache-control": "no-cache"
  }
 };

 var req = https.request(options, function(res) {
  var chunks = [];

  res.on("data", function(chunk) {
   chunks.push(chunk);
  });

  res.on("end", function() {
   var body = Buffer.concat(chunks);
   console.log(body.toString());
   return callback(null, body);
  });
 });


 console.info("Param4Push: ", paramsPush);

 req.write(JSON.stringify(paramsPush));
 req.end();
};
