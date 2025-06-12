const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('./'));

const users = new Map();

io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    socket.on('join-chat', (chat, username) => {
        console.log(`Usuário ${username} (${socket.id}) entrando no chat: ${chat}`);

        if (users.has(socket.id)) {
            const previousChat = users.get(socket.id).chat;
            console.log(`Usuário ${username} saindo do chat anterior: ${previousChat}`);
            socket.leave(previousChat);
            socket.to(previousChat).emit('user-left', username);
        }

        socket.join(chat);
        users.set(socket.id, { chat, username });
        console.log(`Usuário ${username} entrou no chat ${chat}`);
        
        socket.to(chat).emit('user-joined', username);
    });

    socket.on('chat-message', (data) => {
        const user = users.get(socket.id);
        if (user) {
            console.log(`Mensagem de ${user.username} no chat ${user.chat}: ${data.message}`);
            io.to(user.chat).emit('chat-message', {
                username: user.username,
                message: data.message,
                time: new Date().toLocaleTimeString()
            });
        }
    });

    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            console.log(`Usuário ${user.username} desconectado do chat ${user.chat}`);
            socket.to(user.chat).emit('user-left', user.username);
            users.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 