require('dotenv').config();
const http = require('http');
const app = require('./app');
// const { setupSocket } = require('./socket');
const connectDB = require('./config/db');

const server = http.createServer(app);
// setupSocket(server);

const PORT = process.env.PORT || 5000;

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});