import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { db, publicUser } from "../db.js";
import { requireAuth, JWT_SECRET } from "../middleware/auth.js";

const router = Router();

function isValidPassword(pw) {
  // At least 8 chars, one letter, one number
  return typeof pw === "string" && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

router.post("/signup", async (req, res) => {
  const { employeeId, name, email, password, role } = req.body || {};

  if (!employeeId || !name || !email || !password || !role) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }
  if (!["employee", "admin"].includes(role)) {
    return res.status(400).json({ message: "Please select a valid role." });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include a letter and a number.",
    });
  }

  await db.read();
  const emailTaken = db.data.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  const idTaken = db.data.users.some((u) => u.employeeId.toLowerCase() === employeeId.toLowerCase());

  if (emailTaken) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  if (idTaken) {
    return res.status(409).json({ message: "This Employee ID is already registered." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const newUser = {
    id: nanoid(),
    employeeId,
    name,
    email,
    password: passwordHash,
    role,
    department: role === "admin" ? "Human Resources" : "Unassigned",
    designation: role === "admin" ? "HR Officer" : "New Hire",
    phone: "",
    address: "",
    dateOfJoining: new Date().toISOString().slice(0, 10),
    profilePicture: null,
    salary: { basic: 0, hra: 0, allowances: 0, deductions: 0, currency: "INR" },
    createdAt: new Date().toISOString(),
  };

  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ token, user: publicUser(newUser) });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter your email and password." });
  }

  await db.read();
  const user = db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "No account found with that email address." });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Incorrect password. Please try again." });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  await db.read();
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Account not found." });
  res.json({ user: publicUser(user) });
});

export default router;
