const socket = io();

function start() {
    let input = document.getElementById('chatinput');
    let chatbox = document.getElementById('chatbox');
    let avatarURL = '';

    input.addEventListener('keypress', (e) => {
        if (!input.value) return;

        if (e.key === 'Enter') {
            sendMessage();
            input.value = '';
        }
    })

    socket.on('message', msg => {
        renderMessage(msg);
    })



    function sendMessage() {
        socket.emit('message', input.value);
        renderMessage();
    }

    function renderMessage(message) {
        if (!message) {
            const div = document.createElement('div');
            div.className = 'chat-message';
            div.innerHTML = `
            <img src="https://cdn.discordapp.com/avatars/832062645334573096/146d356267380966bc0b322dbe15fb6b.webp?size=2048" class="message-icon">
                <div class="message-body">
                <div class="message-header">
                    Doppelganger
                </div>
                <div class="message-text">
                    ${input.value}
                </div>
            </div>`;
            chatbox.appendChild(div);
        }
        else {
            const div = document.createElement('div');
            div.className = 'chat-message';
            div.innerHTML = `
            <img src="${message.avatar}" class="message-icon">
                <div class="message-body">
                <div class="message-header">
                    ${message.username}
                </div>
                <div class="message-text">
                    ${message.content}
                </div>
            </div>`;
            chatbox.appendChild(div);
        }
    }
}
