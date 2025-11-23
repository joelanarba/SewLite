import io from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let socket = null;

export const connect = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to socket server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });
  } else if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    // We don't nullify socket here to keep listeners if we reconnect, 
    // but usually for full logout we might want to. 
    // For now, just disconnect is enough.
  }
};

export const getSocket = () => {
  return socket;
};

export default {
  connect,
  disconnect,
  getSocket
};
