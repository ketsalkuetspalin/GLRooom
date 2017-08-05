const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

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
        services[data] = false;
        socket.broadcast.emit('ServiceAvailable', data);

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
