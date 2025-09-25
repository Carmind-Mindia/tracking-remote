import dotenv from 'dotenv';
import { createServer } from 'http';
import * as net from 'net';
import { Server, Socket } from 'socket.io';
// Load environment variables from .env file
dotenv.config();

import { ClientsController, ClientsObserver } from './clients.controller';
import "./net_server";

// Observer para notificar cambios en la lista de clientes a través de Socket.IO
class SocketIOClientsObserver implements ClientsObserver {
    constructor(private io: Server) {}

    onClientsChanged(clients: Map<string, net.Socket>): void {
        // Convertir el Map a un array de IMEIs (igual que en el evento 'list')
        const result = [];
        for (const key of clients.keys()) {
            result.push(key);
        }

        // Notificar a todos los clientes Socket.IO conectados usando el evento 'list'
        this.io.emit('list', result);

        console.log(`📡 Notificando lista de clientes - ${result.length} dispositivos: [${result.join(', ')}]`);
    }

    onConfigReceived(imei: string, configContent: string): void {
        // Notificar a todos los clientes Socket.IO sobre el comando config recibido
        this.io.emit('config-received', {
            imei,
            content: configContent,
        });

        console.log(`📋 Notificando comando config recibido - IMEI: ${imei}, Contenido: ${configContent}`);
    }
}
// Create an HTTP server
const server = createServer();

// Create a Socket.IO server instance
const io = new Server(server);

// Crear y registrar el observer para notificar cambios de clientes
const clientsObserver = new SocketIOClientsObserver(io);
ClientsController.getInstance().subscribe(clientsObserver);

console.log('🔧 Observer de Socket.IO registrado para notificar cambios en clientes');

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