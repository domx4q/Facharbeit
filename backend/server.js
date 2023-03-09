import express from 'express';
import https from 'https';
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const activeUsers = new Set(); // Set, um doppelte Einträge zu vermeiden
const conversations = {};


const app = express();
const server = https.createServer({
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/certificate.pem'),
}, app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for private messages
    socket.on('private message', ({ sender, recipient, message }) => {
        console.table({ sender, recipient, message })

        const conversationId = [sender, recipient].sort().join('-'); // generate unique ID based on sender and recipient usernames
        const conversation = conversations[conversationId] || []; // get conversation or initialize empty array if none exists
        conversation.push({ sender, message, timestamp: Date.now() }); // add message to conversation
        conversations[conversationId] = conversation; // update conversation in object

        // Find the recipient socket based on username
        const recipientSocket = Array.from(io.of('/').sockets.values())
                .find(s => s.data.username === recipient);

        if (recipientSocket) {
            recipientSocket.emit('private message', { sender, message });
            socket.emit('private message', { sender, message });
        }
    });

    // Assign a username to the socket
    socket.on('set username', (username) => {
        socket.data = { username };
        console.log("set username: " + socket.data.username)
        activeUsers.add(socket.data.username);
        io.emit('active users', Array.from(activeUsers));
    });

    socket.on("get active users", () => {
        io.emit('active users', Array.from(activeUsers));
    });

    socket.on("get conversation", (conversationId) => {
        console.log("get conversation: " + conversationId)
        socket.emit('conversation', conversations[conversationId]);
    });

    socket.on("writing", (username) => {
        console.log("writing: " + username)
        io.emit('writing', username);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        activeUsers.delete(socket.data.username);
        io.emit('active users', Array.from(activeUsers));
    });
});


server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
