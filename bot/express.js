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
    const guilds = client.guilds.cache;

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
        socket.emit('ready', {
            name: client.user.username,
            iconURL: client.user.avatarURL(),
        })

        guilds.forEach(guild => {
            const channels = guild.channels.cache;
            socket.emit('newGuild', {
                name: guild.name,
                iconURL: guild.iconURL(),
                id: guild.id,
                channels: channels,
            })
        })

        socket.on('message', async msg => {
            if (msg[0] == '!') {
                client.controller.channelID = msg.split(' ').splice(1)[0];
                return
            }
            if (msg[0] == '?') {
                const user = await client.users.fetch(msg.split(' ').splice(1)[0]);
                const channelDM = await user.createDM();
                client.controller.channelID = channelDM.id;
                const messages = await channelDM.messages.fetch({ limit: 100 });
                const messageCache = [];
                messages.each(message => {
                    const msgObject = {
                        content: message.content,
                        name: message.author.username,
                        iconURL: message.author.avatarURL(),
                    }
                    if(message.attachments.size) {
                        msgObject.attachments = message.attachments.first().attachment;
                    }
                    messageCache.push(msgObject);
                });

                socket.emit('newGuild', {
                    name: user.username,
                    iconURL: user.avatarURL(),
                    id: user.id,
                    channels: channelDM,
                });

                socket.emit('messagesCache', {
                    messageCache: messageCache,
                    name: user.username,
                });
                return;
            }
            if (!client.controller.channelID) return;
            const channel = await client.channels.fetch(client.controller.channelID);
            channel.send(msg);
        });

        socket.on('getMessages', async channelID => {
            client.controller.channelID = channelID;
            const channel = await client.channels.fetch(channelID);
            const messages = await channel.messages.fetch({ limit: 100 });
            const messageCache = [];
            messages.each(message => {
                const msgObject = {
                    content: message.content,
                    name: message.author.username,
                    iconURL: message.author.avatarURL(),
                }
                if(message.attachments.size) {
                    msgObject.attachments = message.attachments.first().attachment;
                }
                messageCache.push(msgObject);
            });
            socket.emit('messagesCache', {
                messageCache: messageCache,
                name: channel.name,
            });
        })
    });
})();