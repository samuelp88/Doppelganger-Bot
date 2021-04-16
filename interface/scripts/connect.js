const socket = io();
const guildsManager = new Map();
const botUser = {};

socket.on('ready', user => {
    botUser.name = user.name;
    botUser.iconURL = user.iconURL;
    console.log('foi')
})

function start() {
    let input = document.getElementById('input');
    let chatbox = document.getElementById('chat-display');
    let guilds = document.getElementById('guilds');
    let channelsDisplay = document.getElementById('channels');
    let chatHeader = document.getElementById('chat-header');
    let avatarURL = '';

    input.addEventListener('keypress', (e) => {
        if (!input.value) return;

        if (e.key === 'Enter') {
            sendMessage();
            input.value = '';
        }
    })

    socket.on('newGuild', guild => {
        guildsManager.set(guild.id, guild.channels);
        renderGuild(guild);
    })

    socket.on('messagesCache', cache => {
        chatbox.innerHTML = '';
        if(cache.name) chatHeader.innerHTML = `${cache.name}`;
        for (let i = cache.messageCache.length - 1; i >= 0; i--) {
            renderMessage(cache.messageCache[i])
        }
    })

    socket.on('message', msg => {
        renderMessage(msg);
    });



    function sendMessage() {
        socket.emit('message', input.value);
        const message = {
            name: botUser.name,
            content: input.value,
            iconURL: botUser.iconURL,
        }
        renderMessage(message);
    }

    function renderMessage(message) {
        const div = document.createElement('div');
        div.className = 'message';
        div.id = '';
        div.innerHTML = `
        <img class="message-icon" src="${message.iconURL}">
        <div class="message-body">
            <div class="message-header">${message.name}</div>
            <div class="message-content">${message.content + (message.attachments || '')}</div>
        </div>
        `
        chatbox.appendChild(div)

    }

    function renderGuild(guild) {
        const img = document.createElement('img');
        img.className = 'guild';
        img.src = guild.iconURL || 'https://cdn.discordapp.com/avatars/832062645334573096/146d356267380966bc0b322dbe15fb6b.png?size=1024';
        img.title = guild.name;
        if (Array.isArray(guild.channels)) {
            img.onclick = function () {
                const guildChannels = guildsManager.get(guild.id);
                channelsDisplay.innerHTML = ''; // Clear channels tab

                guildChannels.forEach(channel => {
                    if (channel.type == 'text') {
                        const div = document.createElement('div');
                        div.className = 'channel';
                        div.innerHTML = channel.name;
                        div.onclick = function () {
                            socket.emit('getMessages', channel.id);
                        }
                        channelsDisplay.appendChild(div);
                    }
                })
            }
        } 
        else {
            channelsDisplay.innerHTML = ''; // Clear channels tab
            img.onclick = function () {
                channelsDisplay.innerHTML = ''; // Clear channels tab
                chatHeader.innerHTML = guild.name;
                socket.emit('getMessages', guild.channels.id);
            }
        }
        guilds.appendChild(img);
    }
}
