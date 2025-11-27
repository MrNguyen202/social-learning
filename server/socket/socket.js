const { Server } = require("socket.io");

let io;
const userSockets = new Map();
const userWaitingPayment = new Map();

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
    socket.on("startCall", (payload) => {
      try {
        const { conversationId, callerId, callerName, members } = payload;

        if (!conversationId || !callerId || !callerName || !members) {
          console.error(
            "[Socket] Lỗi startCall: Payload thiếu dữ liệu.",
            payload
          );
          return;
        }

        const otherMembers = members.filter((member) => member.id !== callerId);

        otherMembers.forEach((member) => {
          const receiverSocket = userSockets.get(member.id);

          if (receiverSocket) {
            receiverSocket.emit("incomingCall", {
              callerName,
              conversationId,
            });
          } else {
            console.log(`[Socket] User ${member.name} không online.`);
          }
        });
      } catch (err) {
        console.error(
          "[Socket] LỖI TRONG KHI XỬ LÝ 'startCall':",
          err.message,
          payload
        );
      }
    });

    // LOGIC PHÒNG CHỜ
    socket.on("joinCallRoom", (conversationId) => {
      socket.join(`call_${conversationId}`);
    });

    socket.on("leaveCallRoom", (conversationId) => {
      socket.leave(`call_${conversationId}`);
    });

    // XỬ LÝ TỪ CHỐI CUỘC GỌI
    socket.on("declineCall", ({ conversationId, declinerId }) => {
      io.to(`call_${conversationId}`).emit("callDeclined", { declinerId });
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        const storedSocket = userSockets.get(socket.userId);

        // Chỉ xóa nếu socket bị disconnect LÀ socket đang được lưu
        if (storedSocket && storedSocket.id === socket.id) {
          userSockets.delete(socket.userId);
        } else {
          console.log(
            `[Socket] Bỏ qua disconnect cho ${socket.userId} (socket ${socket.id}), socket mới đang hoạt động.`
          );
        }
      }
    });

    // User waiting payment
    socket.on("user-waiting-payment", ({ userId, orderId }) => {
      userWaitingPayment.set(userId, { socketId: socket.id, orderId });
    });

    socket.on("user-stop-waiting-payment", (userId) => {
      userWaitingPayment.delete(userId);
    });

  });

  io.userSockets = userSockets;
  io.userWaitingPayment = userWaitingPayment;

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
