require("dotenv").config();
const http = require("http");
const app = require("./app");
const { socketInit } = require("./socket/socket");
const connectDB = require("./config/db");

const server = http.createServer(app);

// Khởi tạo socket
socketInit(server);

const PORT = process.env.PORT || 5000;

const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const imageRoute = require("./routes/imageRoute");
const postRoute = require("./routes/postRoute");
const followRoute = require("./routes/followRoute");
const notificationRoute = require("./routes/notificationRoute");
const learningRoute = require("./routes/learning/learningRoute");
const conversationRoute = require("./routes/conversationRoute");
const messageRoute = require("./routes/messageRoute");
const botCoverLearningRoute = require("./routes/learning/botCoverLearningRoute");
const writtingRoute = require("./routes/learning/writingRoute");
const listeningRoute = require("./routes/learning/listeningRoute");

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/images", imageRoute);
app.use("/api/posts", postRoute);
app.use("/api/follows", followRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/learning", learningRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/bot-cover-learning", botCoverLearningRoute);
app.use("/api/learning/writing", writtingRoute);
app.use("/api/learning/listening", listeningRoute);


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
