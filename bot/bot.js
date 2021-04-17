async function startBot() {
    const Discord = require('discord.js');
    const client = new Discord.Client();

    client.controller = {
        channelID: '799756932016767039',
    }

    const { token } = require('./config.json');

    client.on('ready', () => {
        console.log(`Conectado como ${client.user.tag}`);
    });

    client.on('message', async message => {
        if(message.channel.id != client.controller.channelID || message.author.id == client.user.id) return;
        const socket = client.socket;
        if(!client.socket) return;
        const msg = {
            name: message.author.username,
            content: message.content,
            iconURL: message.author.avatarURL(),
            date: message.createdAt.toLocaleString(),
        }
        if(message.attachments.size) {
            msg.attachments = message.attachments.first().url;
        }
        socket.emit('message', msg)
    });

    await client.login(token);

    return client;
}

module.exports = startBot;