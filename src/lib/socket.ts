import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket && token) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }
  return socket!;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
