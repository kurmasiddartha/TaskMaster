import { io } from 'socket.io-client';

// Strip any trailing /api path from the backend URL — socket connects to root
const getRawBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return url.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const SOCKET_URL = getRawBaseUrl();

const socket = io(SOCKET_URL, {
  autoConnect: false,       // connected manually by SocketContext after login
  withCredentials: true,
  // polling first — required for Render's reverse proxy which does HTTP
  // upgrades. Once the connection is established it upgrades to WebSocket.
  transports: ['polling', 'websocket'],
});

export default socket;

