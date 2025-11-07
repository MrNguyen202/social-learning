const { Server } = require("socket.io");

let io;
const userSockets = new Map();

function socketInit(server) {
  io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
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

    // XỬ LÝ TÍN HIỆU GỌI
    socket.on(
      "startCall",
      ({ conversationId, callerId, callerName, members }) => {
        console.log(
          `[Socket] Cuộc gọi bắt đầu từ ${callerName} (ID: ${callerId}) trong phòng ${conversationId}`
        );

        const otherMembers = members.filter((member) => member.id !== callerId);

        otherMembers.forEach((member) => {
          const receiverSocket = userSockets.get(member.id);

          if (receiverSocket) {
            receiverSocket.emit("incomingCall", {
              callerName,
              conversationId,
            });
            console.log(`[Socket] Đã gửi incomingCall đến ${member.name}`);
          } else {
            console.log(`[Socket] User ${member.name} không online.`);
          }
        });
      }
    );

    // LOGIC PHÒNG CHỜ
    socket.on("joinCallRoom", (conversationId) => {
      socket.join(`call_${conversationId}`);
      console.log(
        `[Socket] User ${socket.userId} đã vào phòng chờ call_${conversationId}`
      );
    });

    socket.on("leaveCallRoom", (conversationId) => {
      socket.leave(`call_${conversationId}`);
      console.log(
        `[Socket] User ${socket.userId} đã rời phòng chờ call_${conversationId}`
      );
    });

    // XỬ LÝ TỪ CHỐI CUỘC GỌI
    socket.on("declineCall", ({ conversationId, declinerId }) => {
      io.to(`call_${conversationId}`).emit("callDeclined", { declinerId });
      console.log(
        `[Socket] User ${declinerId} đã từ chối cuộc gọi phòng ${conversationId}`
      );
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
      if (socket.userId) {
        userSockets.delete(socket.userId);
        console.log(`[Socket] Đã xóa ${socket.userId} khỏi userSockets.`);
      }
    });
  });

  io.userSockets = userSockets;

  return io;
}

function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io has not been initialized! Call socketInit(server) first."
    );
  }
  return io;
}

module.exports = { socketInit, getIO };
