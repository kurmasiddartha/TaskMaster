import { createContext, useContext, useEffect } from 'react';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't act until auth has finished resolving from localStorage
    if (loading) return;

    if (user) {
      if (!socket.connected) {
        console.log('[Socket] Connecting...');
        socket.connect();
      }
    } else {
      if (socket.connected) {
        console.log('[Socket] Disconnecting (logged out)');
        socket.disconnect();
      }
    }
  }, [user, loading]);

  // Debug: log connection events once at module level
  useEffect(() => {
    const onConnect    = () => console.log('[Socket] ✅ Connected:', socket.id);
    const onDisconnect = (reason) => console.log('[Socket] ❌ Disconnected:', reason);
    const onError      = (err)    => console.error('[Socket] Error:', err);

    socket.on('connect',           onConnect);
    socket.on('disconnect',        onDisconnect);
    socket.on('connect_error',     onError);

    return () => {
      socket.off('connect',        onConnect);
      socket.off('disconnect',     onDisconnect);
      socket.off('connect_error',  onError);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

