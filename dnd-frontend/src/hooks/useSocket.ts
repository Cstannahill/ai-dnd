import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SocketOptions {
  autoConnect?: boolean;
  serverUrl?: string;
}

export function useSocket(options: SocketOptions = {}) {
  const { autoConnect = true, serverUrl = "ws://localhost:3001" } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const newSocket = io(serverUrl, {
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError(`Connection failed: ${err.message}`);
      setConnected(false);
    });

    newSocket.on("error", (err) => {
      console.error("Socket error:", err);
      setError(`Socket error: ${err.message || err}`);
    });

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [autoConnect, serverUrl]);

  const connect = () => {
    if (socketRef.current && !connected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && connected) {
      socketRef.current.disconnect();
    }
  };

  const emit = (event: string, data?: unknown) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", event);
    }
  };

  return {
    socket,
    connected,
    error,
    connect,
    disconnect,
    emit,
  };
}
