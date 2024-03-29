'use strict';

const EventEmitter = require('events');
const express = require('express');
const http = require('http');
const app = express();


const PORT = process.env.PORT;

app.use(express.static(__dirname+'/public')); 
const server = http.createServer(app);

var template = 
`<!DOCTYPE html> <html> <body>
	<script type="text/javascript">
		var source = new EventSource("/events/");
		source.onmessage = function(e) {
			document.body.innerHTML += e.data + "<br>";
		};
	</script>
</body> </html>`;

app.get('/', function (req, res) {
	res.send(template); // <- Return the static template above
});

let clientId = 0;
let clients = {}; // <- Keep a map of attached clients

const Stream = new EventEmitter(); 
Stream.on("push", (id, data) => {
	//console.log(`Client ID: ${id}`)
	clients[id].write("data: " + JSON.stringify(data) + "\n\n");
});

// Called once for each new client. Note, this response is left open!
app.get('/events/', function (req, res) {
	//req.socket.setTimeout(Number.MAX_VALUE);
	res.writeHead(200, {
		'Content-Type': 'text/event-stream', // <- Important headers
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');
	(function (clientId) {
		clients[clientId] = res; // <- Add this client to those we consider "attached"
		req.on("close", function () {
			delete clients[clientId]
		}); // <- Remove this client when he disconnects
	})(++clientId)

});

setInterval(function () {
    //let msg = Math.random();
    const msg = `${process.env.INSTANCE_ID}<${JSON.stringify(process.memoryUsage())}>`
//	console.log(process.env.INSTANCE_ID+" Clients: " + Object.keys(clients) + " <- " + msg);
	for (clientId in clients) {
		Stream.emit("push", clientId, { msg: {id: process.env.INSTANCE_ID,memory:process.memoryUsage()} });
//		clients[clientId].write("data: " + msg + "\n\n"); // <- Push a message to a single attached client
	};
}, 3000);

server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }

    console.log("SSE now running on port", server.address());
});
