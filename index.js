'use strict';

const Observable = require('@hetrodo/observable');
const webSocketServer = require('express');
const humanNames = require('human-names');
const {WebSocketServer} = require('ws');
const {createServer} = require('http');
const WebRocket = require('@hetrodo/webrocket');
const WebRocketMethod = require('@hetrodo/webrocket/lib/WebRocketMethod');
const WebSocketAdapter = require('@hetrodo/webrocket/lib/WebSocketAdapter');

const app = webSocketServer();
const server = createServer(app);
const wss = new WebSocketServer({server});

const people = new Observable([]);

setInterval(() => {
    if(people.value.length > 10)
        people.value = [];

    people.value.push(humanNames.allRandom());
}, 250);

wss.on('connection', function (ws) {
    const webRocket = new WebRocket(new WebSocketAdapter(ws));

    async function listener(value) {
        await webRocket.post('v1/people', value);
    }

    people.subscribe(listener);

    ws.on('close', () => {
        people.unsubscribe(listener);
    });

    webRocket.on(WebRocketMethod.get, 'v1/people', (request, respond) => respond(people.value));
});

server.listen(8081, function () {
    console.log('Listening on http://localhost:8081');
});
