const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorMiddleware");
const loggerMiddleware = require("./middlewares/loggerMiddleware");

const app = express();

// Middleware
const corsOptions = {
  // Add your allowed origins here
  origin: ['https://www.socialonlinelearning.tech', 'https://socialonlinelearning.tech'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add OPTIONS
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(express.json());
app.use(morgan("dev"));

// Increase payload size limit
app.use(
  express.json({
    limit: "50mb",
    parameterLimit: 50000,
    extended: true,
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Error handling for payload too large
app.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "File quá lớn. Vui lòng chọn file nhỏ hơn 50MB.",
      error: "Payload too large",
    });
  }
  next(error);
});

// Logging system
app.use(loggerMiddleware);

// Routes

// Error handler placed at the end
app.use(errorHandler);

module.exports = app;
