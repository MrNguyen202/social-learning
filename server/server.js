require("dotenv").config();
const http = require("http");
const app = require("./app");
const { socketInit } = require("./socket/socket");
const connectDB = require("./config/db");

const server = http.createServer(app);

// Khởi tạo socket
socketInit(server);

const PORT = process.env.PORT || 5000;

// --- ROUTES USER--- // 
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
const speakingRoute = require("./routes/learning/speakingRoute");
const scoreUserRoute = require("./routes/learning/scoreUserRoute");
const vocabularyRoute = require("./routes/learning/vocabularyRoute");
const rankingRoute = require("./routes/learning/rankingRoute");
const roadMapRoute = require("./routes/learning/roadMapRoute");

// --- ROUTES ADMIN --- //
const adminUserRoute = require("./routes/admin/userRoute");
const adminPostRoute = require("./routes/admin/postRoute");
const achievementRoute = require("./routes/admin/achievementRoute");
const dashboardRoute = require("./routes/admin/dashboardRoute");

// --- API USER --- //

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
app.use("/api/learning/speaking", speakingRoute);
app.use("/api/learning/score-user", scoreUserRoute);
app.use("/api/learning/vocabulary", vocabularyRoute);
app.use("/api/learning/ranking", rankingRoute);
app.use("/api/learning/roadmap", roadMapRoute);

// --- API ADMIN --- //
app.use("/api/admin/users", adminUserRoute);
app.use("/api/admin/posts", adminPostRoute);
app.use("/api/admin/achievements", achievementRoute);
app.use("/api/admin/dashboard", dashboardRoute);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
