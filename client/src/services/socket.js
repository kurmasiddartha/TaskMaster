import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000';

// Create a single socket instance for the whole app lifetime.
// It connects lazily when the first event listener is attached.
const socket = io(SOCKET_URL, {
  autoConnect: false,          // we connect manually after login
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export default socket;
