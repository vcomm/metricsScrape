'use strict';

const msClient = require('rps').rproxyClient;
const request = require('request');
const opts = require('optimist').argv;

const log4js = require('log4js');
const logger = log4js.getLogger('metricsSender');
logger.level = 'trace';

class metricsTarget extends msClient {

    constructor(uri,protocol,asname,events) { 
        super(uri,protocol,asname,events);
    }
    
    evMessage(message,connection) {
        if (message.type === 'utf8') {
            logger.trace(`=> ${this.asname} Received Message: ${message.utf8Data}`);
            try {
                if (message.utf8Data === "Welcome") {
                    connection.sendUTF(JSON.stringify({ head: {
                        target  : 'rproxy',
                        origin  : 'vRouter',
                        request : 'keepalive'
                    }}));
                } else {
                    super.evMessage(message);
                }
            }
            catch(e) {
                // do nothing if there's an error.
                logger.error(`Received Error Message: ${e} `);
            }
        }      
    }
}
   
//console.log(`PARAM: ${opts.uri}`); 

const URI = 'http://localhost:7000/'
const rclient = new metricsTarget(URI,'metrics','vRouter',
    {
        keepalive: (msg) => { return new Promise((resolve) => resolve("Alilya")) }
    });
rclient.connect(URI); 



setTimeout(()=>{
    /*
    request(opts.uri+'address', 
            function (error, response, body) {                                        
                if(error) {
                    logger.error('error:', error); 
                    return;
                } else if(response.statusCode === 200) {
                    logger.trace('body:', body); 
                    const address = JSON.parse(body);
                    const rclient = new asMonTraffic(address.uri,opts.protocol,opts.name,
                        {
                            keepalive: (msg) => { return new Promise((resolve) => resolve("Alilya")) }
                        });
                    rclient.connect(address.uri);  

                    setInterval(()=>{},100);
                 
                } else {
                    logger.warn('statusCode:', response && response.statusCode); 
                }
        });  
    */
    /*
    setInterval(() => {
        // Send Metrics Message
        rclient.request({ 
            head: {
                target  : 'rproxy',
                origin  : 'vRouter',
                request : 'metrics'
            },
            body: JSON.stringify(process.memoryUsage())
        })
        .then(result => { logger.trace("FINITE:",result) })
    },1000)*/     
},1000)
