import { io } from 'socket.io-client';
import { BASE_URL_API } from '@env';

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://192.168.1.5:5000", {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
