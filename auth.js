import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow_dev_secret_change_me_in_production";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "You need to sign in to continue." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "This action is restricted to HR/Admin accounts." });
  }
  next();
}

export { JWT_SECRET };
