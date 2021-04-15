async function startBot() {
    const Discord = require('discord.js');
    const client = new Discord.Client();

    client.controller = {
        channelID: '668138196705738824',
    }

    const { token } = require('./config.json');

    client.on('ready', () => {
        console.log(`Conectado como ${client.user.tag}`);
    });

    client.on('message', async message => {
        if(message.content.startsWith('!')) {
            const args = message.content.split(' ').splice(1)
            client.controller.channelID = args[0];
            return;
        }

        if(message.channel.id != client.controller.channelID || message.author.id == client.user.id) return;
        const socket = client.socket;
        const msg = {
            username: message.author.username,
            content: message.content,
            avatar: message.author.avatarURL(),
        }
        socket.emit('message', msg)
    });

    await client.login(token);

    return client;
}

module.exports = startBot;