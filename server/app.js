const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorMiddleware");
const loggerMiddleware = require("./middlewares/loggerMiddleware");

const app = express();

// Middleware
app.use(cors());
// app.use(express.json());
app.use(morgan("dev"));

// Tăng giới hạn payload - ĐẶT TRƯỚC KHI DEFINE ROUTES
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

// Error handling cho payload quá lớn
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

// hệ thống ghi log
app.use(loggerMiddleware);

// Routes

// Error handler đặt cuối
app.use(errorHandler);

module.exports = app;
