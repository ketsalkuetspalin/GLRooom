'use strict';

(function() {

    var colors = document.getElementsByClassName('color');

    // var url = "http://localhost:3000";
    var url = "http://ragnarok.goodlook.com.mx:3000";

    var socket1 = io(url);
    var socket2 = io(url, {
        forceNew: true
    });
    const sysSocket = io(url, {
        forceNew: true
    });

    const client = io(url, {
        forceNew: true
    });

    var service = false;

    for (var i = 0; i < colors.length; i++) {
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    function onColorUpdate(e) {
        var color = e.target.className.split(' ')[1];
        console.log(color);
        sysSocket.emit('ServiceRequest', color);
    };

    socket1.on('connect', function() {

        console.log("Connected");

        var person_name = "fernanda";

        socket1.emit('room', person_name);

        socket1.emit('LoginGlker', person_name);

        socket1.on('disconnected', function() {

            socket1.emit('LogoutGlker', person_name);
        });

        socket1.on("ServiceAvailable", function(data) {
            console.log(person_name, "Service available", data);
            socket2.emit("AcceptService", {
                user: person_name,
                service: data
            });

        });

        // En servicio
        socket1.on("AcceptService", function(payload) {
            console.log("Accepted", payload);
        });

    });


    socket2.on('connect', function() {

        console.log("Connected");

        var person_name = "Jorge";

        socket2.emit('room', person_name);

        socket2.emit('LoginGlker', person_name);

        socket2.on('disconnected', function() {
            socket2.emit('LogoutGlker', person_name);
        });

        socket2.on("ServiceAvailable", function(data) {
            console.log(person_name, "Service available", data);

            socket2.emit("AcceptService", {
                user: person_name,
                service: data
            });

        });

        // En servicio
        socket2.on("AcceptService", function(payload) {
            console.log("Accepted", payload);
        });

    });

    function onServiceEvent(data) {
        console.log("Service received", data);
    };


})();
