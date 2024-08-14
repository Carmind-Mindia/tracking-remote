
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

    public addClient(imei: string, socket: net.Socket) {
        this.clients.set(imei, socket);
    }

    public getClient(imei: string) {
        return this.clients.get(imei);
    }

    public getClients() {
        return this.clients;
    }

    public removeClient(imei: string) {
        this.clients.delete(imei);
    }

    public removeByAddress(address?: string) {
        this.clients.forEach((value, key) => {
            if (value.destroyed || value.remoteAddress === address) {
                try {
                    value.destroy();
                } catch (e) {
                    console.error("Error when destroy socket:" + e);
                }
                this.clients.delete(key);
            }
        });
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