
// const clients = new Map<string, net.Socket>();

// export function sendConfigCommand(imei: string) {
//     var socket = clients.get(imei);
//     if (socket) {
//         var dataTosend = Encoder.getConfigSettingMsg(imei, "CONFIG#", CryptoTool.MessageEncryptType.NONE, null);
//         socket.write(Buffer.from(dataTosend));
//     }
// }

import * as net from 'net';
import CryptoTool from './topflycodec/CryptoTool';
import Encoder from './topflycodec/Encoder';

// Interface para el patrón Observer
export interface ClientsObserver {
    onClientsChanged(clients: Map<string, net.Socket>): void;
    onConfigReceived?(imei: string, configContent: string): void;
}

export class ClientsController { 
    
    // Singleton
    private static instance: ClientsController;
    private constructor() { }
    static getInstance(): ClientsController {
        if (!ClientsController.instance) {
            ClientsController.instance = new ClientsController();
        }
        return ClientsController.instance;
    }

    private clients = new Map<string, net.Socket>();
    private observers: ClientsObserver[] = [];

    // Métodos para manejar observers
    public subscribe(observer: ClientsObserver): void {
        this.observers.push(observer);
    }

    public unsubscribe(observer: ClientsObserver): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    private notifyClientsChanged(): void {
        // Crear una copia de la lista para evitar modificaciones externas
        const clientsCopy = new Map(this.clients);
        
        this.observers.forEach(observer => {
            try {
                observer.onClientsChanged(clientsCopy);
            } catch (error) {
                console.error(`Error notifying observer on clients changed: ${error}`);
            }
        });
    }

    public notifyConfigReceived(imei: string, configContent: string): void {
        this.observers.forEach(observer => {
            try {
                if (observer.onConfigReceived) {
                    observer.onConfigReceived(imei, configContent);
                }
            } catch (error) {
                console.error(`Error notifying observer on config received: ${error}`);
            }
        });
    }

    public addClient(imei: string, socket: net.Socket) {
        this.clients.set(imei, socket);
        this.notifyClientsChanged();
    }

    public getClient(imei: string) {
        return this.clients.get(imei);
    }

    public getClients() {
        return this.clients;
    }

    public removeClient(imei: string) {
        const socket = this.clients.get(imei);
        if (socket) {
            this.clients.delete(imei);
            this.notifyClientsChanged();
        }
    }

    public removeByAddress(address?: string) {
        let removedAny = false;
        this.clients.forEach((socket, imei) => {
            if (socket.destroyed || socket.remoteAddress === address) {
                try {
                    socket.destroy();
                } catch (e) {
                    console.error("Error when destroy socket:" + e);
                }
                this.clients.delete(imei);
                removedAny = true;
            }
        });
        
        if (removedAny) {
            this.notifyClientsChanged();
        }
    }

    public sendConfigCommand(imei: string) {
        var socket = this.clients.get(imei);
        if (socket) {
            var dataTosend = Encoder.getConfigSettingMsg(imei, "CONFIG#", CryptoTool.MessageEncryptType.NONE, null);
            socket.write(Buffer.from(dataTosend));
        } else {
            console.error("The device is not connected,imei:" + imei);
        }
    }

    public sendCommand(imei: string, command: string) {
        var socket = this.clients.get(imei);
        if (!imei || !command) {
            console.error("The imei or command is empty");
            return;
        }

        if (!command.endsWith("#")) {
            command += "#";
        }

        if (socket) {
            var dataTosend = Encoder.getConfigSettingMsg(imei, command, CryptoTool.MessageEncryptType.NONE, null);
            socket.write(Buffer.from(dataTosend));
        } else {
            console.error("The device is not connected,imei:" + imei);
        }
    }

}