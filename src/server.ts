import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
// Load environment variables from .env file
dotenv.config();

import { ClientsController } from './clients.controller';
import "./net_server";
// Create an HTTP server
const server = createServer();

// Create a Socket.IO server instance
const io = new Server(server);

// Listen for connection events
io.on('connection', (socket: Socket) => {
    // Handle socket events here
    
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('config', (data: {imei: string, content: string}) => {
        const { imei, content } = data;
        console.log(`Config command received for device ${imei}: ${content}`);
        ClientsController.getInstance().sendCommand(imei, content);
    })

    socket.on('list', () => {
        const clients = ClientsController.getInstance().getClients();
        clients.set('test', {} as any);
        clients.set('test1', {} as any);
        clients.set('test2', {} as any);
        clients.set('test3', {} as any);
        var result = [];
        for (var key of clients.keys()) {
            result.push(key);
        }
        socket.emit('list', result);
    });
    
});

// Start the server
const port = process.env.SOCKET_PORT; 
server.listen(port, () => {
    console.log(`Socket.IO server is running on port ${port}`);
});