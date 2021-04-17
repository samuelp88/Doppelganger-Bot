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
            date: new Date().toLocaleString(),
        }
        renderMessage(message);
    }

    function renderMessage(message) {
        const div = document.createElement('div');
        div.className = 'message';
        div.id = '';
        div.innerHTML = `
        <img class="message-icon" src="${message.iconURL || 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/198142ac-f410-423a-bf0b-34c9cb5d9609/dbtif5j-60306864-d6b7-44b6-a9ff-65e8adcfb911.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvMTk4MTQyYWMtZjQxMC00MjNhLWJmMGItMzRjOWNiNWQ5NjA5XC9kYnRpZjVqLTYwMzA2ODY0LWQ2YjctNDRiNi1hOWZmLTY1ZThhZGNmYjkxMS5wbmcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.W3KM95rnj_ofajggtIrj5DA6xNti742Ho-VWcV1uYd4'}">
        <div class="message-body">
            <div class="message-header">
                ${message.name}
                <div class="message-date">${message.date}</div>
            </div>
            <div class="message-content">${message.content + ' ' +(message.attachments || '')}</div>
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
