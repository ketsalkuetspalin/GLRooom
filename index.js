const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var timer = require('nano-timer');

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
        var associates = [];
        var assoData = data.associates;
        for (var i = 0; i < assoData.length; i++) {
            associates.push(assoData[i].IdAssociated);
        }
        services[data.transaction.idTransaction] = associates;
        socket.broadcast.emit('ServiceAvailable', data);

        timer(10000 /*ms*/ , 'ok').then(function(v) {
            console.log("Send notifications to: " + remainAsso.lenght);

            var remainAsso = services[data.transaction.idTransaction];
            console.log(remainAsso);
            for (var j = 0; j - remainAsso.length; i++) {
                console.log("Send notification for : " + remainAsso[i]);
            }
            timer.cancel();
        }).catch(function(e) {
            console.error("Error on send notifications: " + e);
        });

        socket.emit("RequestAccepted");

    });

    socket.on("ServiceReceived", function(payload) {
        var transaction = payload.transaction;
        var associated = payload.associated;

        console.log("Service received by", associated);

        var array = services[transaction];
        var index = array.find(a => a === associated);

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
