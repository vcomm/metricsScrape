'use strict';

const EventSource = require('eventsource')
//const EventSource = require('node-eventsource-http2/lib')
/*
const eSource = new EventSource('http://localhost:50999/events/')
eSource.addEventListener('open', (e) => {
  console.log(`Connection was opened: ${JSON.stringify(e)}`)
}, false)
eSource.addEventListener('message', (e) => {
  console.log(e.data);
}, false);
eSource.addEventListener('error', (e) => {
  if (e.readyState == EventSource.CLOSED) { 
    console.log(`Connection was closed: ${e}`);
  }
}, false);

*/
const targets = [
  'http://localhost:5000/events/',
  'http://localhost:5001/events/',
  'http://localhost:5002/events/',
  'http://localhost:5003/events/'
]
targets.map((item) => {
  (new EventSource(item))
    .onmessage = function(e) { console.log(`Data: ${e.data}`) };
  console.log(`Subscribe Metrics: ${item}`)
})
