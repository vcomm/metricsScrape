const EventSource = require('eventsource')
//const EventSource = require('node-eventsource-http2/lib')
const es = new EventSource('http://localhost:5000/events/')
/*
es.addEventListener('server-metrics', function (e) {
  console.log(e.data)
})*/
es.onmessage = function(e) {
    console.log(e.data)
};
console.log('Subscribe: to http://localhost:5000/events')