import { createContext, useContext, useEffect } from 'react';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect when the user is logged in
      if (!socket.connected) socket.connect();
    } else {
      // Disconnect when logged out
      if (socket.connected) socket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
