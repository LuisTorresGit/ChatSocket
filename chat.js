const socket = io();

const chatTitle = document.getElementById('chat-title');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const chat = urlParams.get('chat');

if (!username || !chat) {
    window.location.href = '/';
}

chatTitle.textContent = `Chat ${chat === 'chat1' ? '1' : '2'}`;

socket.emit('join-chat', chat, username);

addSystemMessage(`Bem-vindo ao Chat ${chat === 'chat1' ? '1' : '2'}, ${username}!`);

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat-message', {
            message: message,
            username: username,
            chat: chat
        });
        messageInput.value = '';
    }
}

socket.on('chat-message', (data) => {
    console.log('Mensagem recebida:', data);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <span class="username">${data.username}</span>
        <span class="time">${data.time}</span>
        <div>${data.message}</div>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('user-joined', (joinedUsername) => {
    if (joinedUsername !== username) {
        addSystemMessage(`${joinedUsername} entrou no chat`);
    }
});

socket.on('user-left', (leftUsername) => {
    if (leftUsername !== username) {
        addSystemMessage(`${leftUsername} saiu no chat`);
    }
});

function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
} 