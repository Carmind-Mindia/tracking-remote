import moment from 'moment';
import * as net from 'net';
import { ClientsController } from './clients.controller';
import CryptoTool from './topflycodec/CryptoTool';
import * as Decoder from "./topflycodec/Decoder";
import * as Encoder from "./topflycodec/Encoder";


export const clients = new Map<string, net.Socket>();

const server = net.createServer((socket) => {
    ClientsController.getInstance().removeByAddress();

    // Handle incoming connections
    socket.on('data', (data) => {

        var messageList = Decoder.decode(data);
        for(var messageIndex in messageList){
            var message = messageList[messageIndex]
            var messageType: String = message.messageType;

            switch (messageType) {
                case "signIn":
                    ClientsController.getInstance().addClient(message.imei, socket);
                    var resp = Encoder.getSignInMsgReply(message.imei, true, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "heartbeat":
                    var resp = Encoder.getHeartbeatMsgReply(message.imei, true, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "location":
                    console.log("receive location message,imei:" + message.imei + "," + moment(message.date._d).format("YYYY-MM-DD HH:mm:ss"));
                    console.log("latitude:" + message.latitude + ",longitude:" + message.longitude + ",samplingIntervalAccOn:" + message.samplingIntervalAccOn + 
                    ",samplingIntervalAccOff:" + message.samplingIntervalAccOff + ",iopACOn:" + message.iopACOn + ",isAlarmData:" + message.isAlarmData
                    );
                    
                    var resp: any = {};
                    if (message.isAlarmData) {
                        resp = Encoder.getLocationAlarmMsgReply(message.imei, true, message.serialNo, message.originalAlarmCode, message.protocolHeadType, CryptoTool.MessageEncryptType.NONE, null);
                    } else {
                        resp = Encoder.getLocationMsgReply(message.imei, true, message.serialNo, message.protocolHeadType, CryptoTool.MessageEncryptType.NONE, null);
                    }
                    socket.write(Buffer.from(resp));
                    break;
                case "config":
                    console.log("receive config message,imei:" + message.imei + ",config content:" + message.content);
                    break;
                case "gpsDriverBehavior":
                    console.log("receive gpsDriverBehavior message,imei:" + message.imei);
                    var resp = Encoder.getGpsDriverBehaviorMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "accelerationDriverBehavior":
                    console.log("receive accelerationDriverBehavior message,imei:" + message.imei);
                    var resp = Encoder.getAccelerationDriverBehaviorMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "accidentAcceleration":
                    console.log("receive accidentAcceleration message,imei:" + message.imei);
                    var resp = Encoder.getAccelerationAlarmMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "rs232Data":
                    console.log("receive rs232Data message,imei:" + message.imei);
                    var resp = Encoder.getRS232MsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "bluetoothData":
                    console.log("receive bluetoothData message,imei:" + message.imei);
                    var resp = Encoder.getBluetoothPeripheralMsgReply(message.imei, message.serialNo, message.protocolHeadType, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "networkInfo":
                    console.log("receive networkInfo message,imei:" + message.imei);
                    var resp = Encoder.getNetworkMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "wifi":
                    console.log("receive wifi message,imei:" + message.imei);
                    var resp = Encoder.getWifiMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "obdData":
                    console.log("receive obd message,imei:" + message.imei);
                    var resp = Encoder.getObdMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "rs485":
                    console.log("receive rs485 message,imei:" + message.imei);
                    var resp = Encoder.getRs485MsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                case "oneWire":
                    console.log("receive oneWire message,imei:" + message.imei);
                    var resp = Encoder.getOneWireMsgReply(message.imei, message.serialNo, CryptoTool.MessageEncryptType.NONE, null);
                    socket.write(Buffer.from(resp));
                    break;
                default:
                    break;
            }
        }
        


    });

    socket.on('end', () => {
        ClientsController.getInstance().removeByAddress(socket.remoteAddress);
    });

    socket.on('error', (err) => {
        ClientsController.getInstance().removeByAddress(socket.remoteAddress);
    });

    socket.on('timeout', () => {
        ClientsController.getInstance().removeByAddress(socket.remoteAddress);
    });
});

const port = process.env.GPS_PORT;
server.listen(port, () => {
    console.log('GPS server started on port ' + port);
});
