import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function useSocket(documentId = null) {
  const socketRef = useRef(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setConnected(true);
      if (documentId) {
        socket.emit("join:document", documentId);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("document:status", (data) => {
      setLastEvent(data);
    });

    socket.on("document:update", (data) => {
      setLastEvent(data);
    });

    return () => {
      if (documentId) {
        socket.emit("leave:document", documentId);
      }
      socket.disconnect();
    };
  }, [documentId]);

  return { socket: socketRef.current, connected, lastEvent };
}
