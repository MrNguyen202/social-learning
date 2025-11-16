import { io } from 'socket.io-client';

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    // socket = io('http://10.0.2.2:5000', {
    socket = io('http://192.168.1.12:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
