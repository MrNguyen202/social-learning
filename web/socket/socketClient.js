import { io, Socket } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket && typeof window !== "undefined") {
        socket = io("http://localhost:5000", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
};
