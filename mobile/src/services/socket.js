import io from 'socket.io-client';

// Use the same base URL as your API
const SOCKET_URL = 'http://10.241.97.112:3000';

const socket = io(SOCKET_URL, {
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

export default socket;
