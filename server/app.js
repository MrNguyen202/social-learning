const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorMiddleware');
const loggerMiddleware = require('./middlewares/loggerMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// hệ thống ghi log
app.use(loggerMiddleware);

// Routes

// Error handler đặt cuối
app.use(errorHandler);

module.exports = app;