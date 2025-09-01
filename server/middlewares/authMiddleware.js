const supabase = require("../lib/supabase").supabase;

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
};

module.exports = authMiddleware;
