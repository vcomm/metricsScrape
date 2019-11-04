'use strict';

const http2 = require('http2');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const uniqid = require('uniqid');
const rvsProxy = require('rps');
const httpRequest = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const log4js = require('log4js');
const logger = log4js.getLogger('scraperMonitor');
logger.level = 'trace';

class monScraper extends rvsProxy.rproxyServer {
    constructor(router,events) {
        super(router,events);
        this.name = 'monScraper';
    }
    originIsAllowed(channel,service) {
        if(channel && service)
           return true;
        else return false;
    }
    evRequest(request,parent) {
        let connection = null;
        if (request.requestedProtocols[0] === 'webclient') {
            const type    = request.requestedProtocols[0];
            const service = request.requestedProtocols[1];
            const uid  = request.requestedProtocols[2];
            const sid  = request.requestedProtocols[3];

            connection.origin = { channel: service, client: type, sid: sid };
            logger.trace(`Connection accepted client: ${type} to session: ${sid}`);
        } else {
            let channel = request.requestedProtocols;
            let service = request.origin;
            if (this.originIsAllowed(channel,service)) {
                connection = request.accept(channel[0],service);
                connection.origin = { channel: channel, service: service };
                //super.setServiceConnection(channel,service,connection);
                logger.trace(`wsServer Connection accepted microservice: ${service}[${channel}]`);
            } else {
                request.reject();
                logger.warn(`wsServer Connection rejected microservice: ${service}[${channel}]`);
                return connection;
            }
        }

        connection.on('message', function(message) {
            parent.evMessage(message,connection);
        });

        connection.on('close', function(reasonCode, description) {
            if (connection.origin.service)
                ;//parent.delServiceConnection(connection.origin.channel,connection.origin.service);
            else if(connection.origin.client) {
                parent.msgSend({
                    type: 'utf8',
                    utf8Data: JSON.stringify({
                        msg: 'disconnect',
                        type: 'target',
                        uid:  connection.origin.client
                    })
                },connection.origin.channel); 
            }  
            logger.trace(` Peer ${JSON.stringify(connection.origin)} disconnected.`);
        });        

        connection.sendUTF("Welcome");
        return connection;        
    }
    evMessage(message,connection) {
        if (message.type === 'utf8') {
            try {
                let command = super.evMessage(message,connection);
                if (this.onMessage[command.msg])
                    this.onMessage[command.msg](command.data,connection);
            } catch(e) {
                // do nothing if there's an error.
                logger.error(`Received Error Message: ${e}`);
            }
        }
    }
}

const scraperSrv = new monScraper({}, {
    keepalive: (data) => { 
        return new Promise((resolve,reject) => {
            if (data) {
                resolve(data)
            } else {
                reject(`Wrong data: `)
            }
        }) 
        .then(data => {
            logger.debug(`KeepAlive: ${JSON.stringify(data)}`)
        })
        .catch((error) => {
            logger.warn(`KeepAlive: ${error}`)
        }); 
    }
});

/*
const server = http2.createServer(app);
server.listen(process.env.PORT || 7000, (err) => {
        if (err) {
            throw new Error(err);
        }

        logger.trace("Metrics Scraping Server now running on port", server.address());
        scraperSrv.startWsServer(server);
    });
*/
let server = app.listen(process.env.PORT || 7000, function () {    
    logger.trace("Metrics Scraping Server now running on port", server.address());
    scraperSrv.startWsServer(server);
});
