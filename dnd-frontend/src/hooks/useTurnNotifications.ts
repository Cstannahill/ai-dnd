import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface TurnNotification {
  playerId: string;
  summary: string;
}

export function useTurnNotifications(
  playerId: string | null,
  socket: Socket | null
) {
  useEffect(() => {
    if (!socket || !playerId) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const handler = (payload: TurnNotification) => {
      if (
        payload.playerId === playerId &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Your turn", { body: payload.summary });
      }
    };

    socket.on("turn-notification", handler);
    return () => {
      socket.off("turn-notification", handler);
    };
  }, [socket, playerId]);
}
