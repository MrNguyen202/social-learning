import { io } from 'socket.io-client';
import { BASE_URL_API } from '@env';

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(BASE_URL_API, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
