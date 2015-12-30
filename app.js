/**
  ~ Copyright (c) 2016 Androidhacks7
  ~
  ~ Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  ~
  ~ The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  ~
  ~ THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  **/

var bodyParser = require('body-parser');
var express = require('express');
var config = require('./config/config');
var io = require('socket.io')();
var openDB = require('json-file-db');
var db = openDB('db.json');

var app = express();
app.listen(config.HTTP_PORT);
app.use(bodyParser.json());

io.listen(config.SOCKET_PORT);

console.log("Server is up");

app.get('/test', function(req, res) {
	console.log("Test server ping succes");
});

app.post('/userRegistration', function(req, res) {
	res.statusCode = config.SUCCESS_RESPONSE;
	
	console.log("Registering user " + req.body.userName + " socketId " + req.body.socketId);

	db.put({"id":Math.floor((Math.random() * 1000000) + 1),"userName" : req.body.userName, "socketId" : req.body.socketId, "deviceId" : req.body.deviceId}, function(err){
	 
		db.get(function(err, data){
  			var result = [];
			for (var i = 0; i < data.length; i++) {
				if(data[i].userName !== req.body.userName){
					result.push(data[i]);
				}
			}
			res.send({"users":result});
			res.end();
		});
	});
});


	io.sockets.on('connection', function(socket) {
		
		console.log("Socket log");

		socket.on('call', function(incoming) {
			console.log("Call from " + incoming.caller + " to " + incoming.receiver);
			var caller = incoming.caller;
			var receiver = incoming.receiver;
			db.get({userName: receiver}, function(err, data) {
				io.to(data[0].socketId).emit('incomingcall', incoming);
			});
		});

		socket.on('call_status', function(incoming) {
			console.log("CALL STATUS  " + incoming.status);
			db.get({userName : incoming.caller}, function(err, data) {

				if (incoming.status) {
					io.to(data[0].socketId).emit("receiver_accepted_call", incoming);
				} else {
					io.to(data[0].socketId).emit("receiver_rejected_call");
				}
			});
		});

		socket.on('on_sdp', function(incoming) {
			console.log("Sending sdp to user " + incoming.receiver);
			db.get({userName : incoming.receiver}, function(err, data) {
				io.to(data[0].socketId).emit("remote_sdp_received", incoming);
			});
		});
		
		socket.on('on_ice_candidate', function(incoming) {
			console.log("Sending iceCandidate to user " + incoming.receiver);
			db.get({userName : incoming.receiver}, function(err, data) {
				io.to(data[0].socketId).emit("ice_candidate_received", incoming);
			});
		});

		socket.on('on_disconnect', function(incoming) {
			db.get({userName : incoming.peer}, function(err, data) {
				console.log("Sending disconnect status to " + incoming.initiator);
				console.log("Sending disconnect status to " + incoming.peer);
				io.to(data[0].socketId).emit("on_disconnect", incoming);
			});
			db.delete({userName : incoming.initiator}, function(err, data) {
			});
			db.delete({userName : incoming.peer}, function(err, data) {
			});
			});
		});
	

	





