import { production } from '@/constant/baseURL';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = production ? "https://8fp9fvw1-5001.inc1.devtunnels.ms" : 'https://8fp9fvw1-5001.inc1.devtunnels.ms'; // Update if backend runs elsewhere

export default function useSocket(userId, onNotification) {
  const socketRef = useRef();

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', userId);
    });

    socketRef.current.on('notification', (data) => {
      if (onNotification) onNotification(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, onNotification]);

  return socketRef;
}
