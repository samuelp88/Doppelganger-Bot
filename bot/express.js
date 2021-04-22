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
        const guilds = [];
        client.socket = socket;
        console.log('Interface conectada');

        client.guilds.cache.forEach(g => {
            const guild = {
                id: g.id,
                name: g.name,
                iconURL: g.iconURL(),
                channels: g.channels.cache.map(channel => {
                    return {
                        id: channel.id,
                        type: channel.type,
                        name: channel.name
                    }
                }),
            };
            guilds.push(guild);
        });

        socket.emit('ready', {
            name: client.user.username,
            iconURL: client.user.avatarURL(),
            guilds: guilds,
        })

        socket.on('newDM', async id => {
            const user = await client.users.fetch(id);
            const channelDM = await user.createDM();
            client.controller.channelID = channelDM.id;
            const messages = await channelDM.messages.fetch({ limit: 100 });
            const messageCache = [];
            messages.each(message => {
                const msgObject = {
                    name: message.author.username,
                    content: message.content,
                    iconURL: message.author.avatarURL(),
                    date: message.createdAt.toLocaleString(),
                }
                if (message.attachments.size) {
                    msgObject.attachments = message.attachments.first().attachment;
                }
                messageCache.push(msgObject);
            });

            const msg = {
                id: channelDM.id,
                name: user.username,
                author: user,
                content: '',
                iconURL: user.avatarURL(),
                test: false,
            }
            socket.emit('dm-message', msg);

            socket.emit('messagesCache', {
                messageCache: messageCache,
                name: user.username,
            });

            return;
        })

        socket.on('message', async msg => {
            if (msg[0] == '?') {
                try {
                    const user = await client.users.fetch(msg.split(' ').splice(1)[0]);
                    const channelDM = await user.createDM();
                    client.controller.channelID = channelDM.id;
                    const messages = await channelDM.messages.fetch({ limit: 100 });
                    const messageCache = [];
                    messages.each(message => {
                        const msgObject = {
                            name: message.author.username,
                            content: message.content,
                            iconURL: message.author.avatarURL(),
                            date: message.createdAt.toLocaleString(),
                        }
                        if (message.attachments.size) {
                            msgObject.attachments = message.attachments.first().attachment;
                        }
                        messageCache.push(msgObject);
                    });

    

                    socket.emit('messagesCache', {
                        messageCache: messageCache,
                        name: user.username,
                    });
                    return;
                }
                catch {
                    error('Não é possivel abrir uma DM para esse ID.')
                    return;
                }
            }
            if (!client.controller.channelID) return;

            const channel = await client.channels.fetch(client.controller.channelID);
            channel.send(msg).catch(e => {
                error('Não é possivel enviar mensagens para esse usuario.')
            });


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
                    date: message.createdAt.toLocaleString(),
                }
                if (message.attachments.size) {
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

    function error(errorMessage) {
        const socket = client.socket;
        const error = {
            name: 'Erro',
            content: errorMessage,
            iconURL: 'https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/alert-circle-red-512.png',
        }
        socket.emit('message', error);
    }


})();