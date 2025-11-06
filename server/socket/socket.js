const { Server } = require("socket.io");

let io;
const userSockets = new Map();

function socketInit(server) {
    io = new Server(server, {
        cors: { origin: "*" },
        transports: ["websocket", "polling"]
    });

    io.on("connection", (socket) => {
        socket.on("user-online", ({ userId }) => {
            socket.userId = userId;
            userSockets.set(userId, socket);
        });

        socket.on("joinRoom", (conversationId) => {
            socket.join(conversationId);
        });

        socket.on("leaveRoom", (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });

    io.userSockets = userSockets;

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io has not been initialized! Call socketInit(server) first.");
    }
    return io;
}

module.exports = { socketInit, getIO };
