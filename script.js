const socket = io();

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username');
const chatSelect = document.getElementById('chat-select');
const enterChatBtn = document.getElementById('enter-chat');
const chatTitle = document.getElementById('chat-title');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let currentUsername = '';
let currentChat = '';

socket.on('connect', () => {
    console.log('Conectado ao servidor!');
    addSystemMessage('Conectado ao servidor!');
});

socket.on('disconnect', () => {
    console.log('Desconectado do servidor!');
    addSystemMessage('Desconectado do servidor!');
});

enterChatBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const chat = chatSelect.value;

    if (!username || !chat) {
        alert('Por favor, preencha seu nome e escolha um chat!');
        return;
    }

    window.location.href = `chat.html?username=${encodeURIComponent(username)}&chat=${encodeURIComponent(chat)}`;
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        messageInput.value = '';
    }
}

socket.on('chat-message', (data) => {
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

socket.on('user-joined', (username) => {
    if (username !== currentUsername) {
        addSystemMessage(`${username} entrou no chat`);
    }
});

socket.on('user-left', (username) => {
    if (username !== currentUsername) {
        addSystemMessage(`${username} saiu do chat`);
    }
});

function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
} 