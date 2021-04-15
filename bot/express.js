const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = 3000

const io = require('socket.io')(server);
const path = require('path');
const bot = require('./bot');


(async () => {

    const client = await bot();

    app.use(express.static(path.join(__dirname, '../interface')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../interface/index.html'))
    })

    server.listen(port, () => {
        console.log(`Escutando em http://localhost:${port}`)
    })

    io.on('connection', socket => {
        client.socket = socket;
        console.log('Interface conectada')
        socket.on('message', async msg => {
            if(msg[0] == '!') {
                client.controller.channelID = msg.split(' ').splice(1)[0];
                return
            }
            if(!client.controller.channelID) return;
            const channel = await client.channels.fetch(client.controller.channelID);
            channel.send(msg);
        })
    });
})();