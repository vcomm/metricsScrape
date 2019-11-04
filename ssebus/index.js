const EventSource = require('eventsource')
//const EventSource = require('node-eventsource-http2/lib')

const targets = [
  'http://localhost:5000/events/',
  'http://localhost:5001/events/'
]
targets.map((item) => {
  (new EventSource(item))
    .onmessage = function(e) {
      console.log(`Data: ${e.data}`)
    };
})
console.log('Subscribe Metrics: to http://localhost:500X/events')