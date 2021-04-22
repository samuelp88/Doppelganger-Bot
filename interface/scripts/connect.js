const socket = io();
const botUser = {};
let currentChannel = '';
const button = {
    active: false,
}


function start() {
    let input = document.getElementById('input');
    let chatbox = document.getElementById('chat-display');
    let guilds = document.getElementById('guilds');
    let channelsDisplay = document.getElementById('channels');
    let chatHeader = document.getElementById('chat-header');
    let dms = document.getElementById('dms');

    socket.on('ready', user => {
        if (botUser.ready) return;
        botUser.name = user.name;
        botUser.iconURL = user.iconURL;
        botUser.guilds = user.guilds;
        botUser.directmessages = new Map();
        botUser.ready = true;

        botUser.guilds.forEach(guild => renderGuild(guild));
    })


    input.addEventListener('keypress', (e) => {
        if (!input.value) return;

        if (e.key === 'Enter') {
            sendMessage();
            input.value = '';
        }
    })

    socket.on('messagesCache', cache => {
        chatbox.innerHTML = '';
        if (cache.name) chatHeader.innerHTML = `${cache.name}`;
        for (let i = cache.messageCache.length - 1; i >= 0; i--) {
            renderMessage(cache.messageCache[i])
        };
        removePeepoPing(currentChannel);
    })

    socket.on('message', msg => {
        renderMessage(msg);
    });

    socket.on('dm-message', msg => {
        if (!botUser.directmessages.get(msg.author.id)) {
            botUser.directmessages.set(msg.author.id, []);
            renderDM(msg);
        }
        if (msg.id != currentChannel) peepoPing(msg.id);
        const dm = botUser.directmessages.get(msg.author.id);
        dm.push(msg);
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
            <div class="message-content">${message.content + ' ' + (message.attachments || '')}</div>
        </div>
        `
        chatbox.appendChild(div)

    }

    function renderGuild(guild) {
        const img = document.createElement('img');
        img.className = 'guild';
        img.src = guild.iconURL || 'https://cdn.discordapp.com/avatars/832062645334573096/146d356267380966bc0b322dbe15fb6b.png?size=1024';
        img.title = guild.name;

        img.onclick = function () {
            clearChannelsTab();
            loadChannels(guild.channels);
        }


        guilds.appendChild(img);
    }

    function renderDM(dm) {
        const div = document.createElement('div');
        div.className = 'direct-message';
        div.title = dm.name;
        div.innerHTML =
            `<img class="dm-image" src="${dm.iconURL}">
         <div class="" id="${dm.id}"></div>`;
        div.onclick = function () {
            currentChannel = dm.id;
            socket.emit('getMessages', dm.id);
            clearChannelsTab();

            socket.once('messagesCache', cache => {
                chatHeader.innerHTML = dm.name;
            })
        }
        dms.appendChild(div);
    }

    function peepoPing(dmID) {
        const dm = document.getElementById(dmID)
        dm.className = "peepoping";
    }

    function removePeepoPing(dmID) {
        const dm = document.getElementById(dmID)
        if (dm) dm.className = "";
    }

    //Channel related functions
    function clearChannelsTab() {
        channelsDisplay.innerHTML = ''; // Clear channels tab
    }

    function loadChannels(channels) {
        channels.forEach(channel => {
            const div = document.createElement('div');
            div.className = 'channel';
            div.innerHTML = channel.name;
            div.onclick = function () {
                currentChannel = channel.id;
                socket.emit('getMessages', channel.id); // Maybe i need to change this later
            }
            channelsDisplay.appendChild(div);
        })
    }

}

function toggleDMButton() {
    const dmbutton = document.getElementById('dm-button');
    if (!button.active) {
        dmbutton.innerHTML = '<input type="text" class="dm-input" id="dm-input">';
        const input = document.getElementById('dm-input');
        input.focus();
        button.active = true;

        input.addEventListener('keypress', (e) => {
            if (!input.value) return

            if (e.key === 'Enter') {
                newDM(input.value);
                toggleDMButton();
            }
        });
    }
    else {
        dmbutton.innerHTML = '';
        button.active = false;
    }
}

function newDM(userID) {
    socket.emit('newDM', userID);
}


