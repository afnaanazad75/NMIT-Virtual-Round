import { Router } from "express";
import { db, publicUser } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// List all employees (admin only)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  await db.read();
  const users = db.data.users.map(publicUser);
  res.json({ users });
});

// Get a single employee profile
router.get("/:id", requireAuth, async (req, res) => {
  await db.read();
  const { id } = req.params;

  if (req.user.role !== "admin" && req.user.id !== id) {
    return res.status(403).json({ message: "You can only view your own profile." });
  }

  const user = db.data.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Employee not found." });

  res.json({ user: publicUser(user) });
});

const EMPLOYEE_EDITABLE_FIELDS = ["phone", "address", "profilePicture"];
const ADMIN_EDITABLE_FIELDS = [
  "name",
  "phone",
  "address",
  "department",
  "designation",
  "dateOfJoining",
  "profilePicture",
];

// Update a profile
router.put("/:id", requireAuth, async (req, res) => {
  await db.read();
  const { id } = req.params;
  const user = db.data.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Employee not found." });

  const isSelf = req.user.id === id;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: "You don't have permission to edit this profile." });
  }

  const allowedFields = isAdmin ? ADMIN_EDITABLE_FIELDS : EMPLOYEE_EDITABLE_FIELDS;
  for (const field of allowedFields) {
    if (field in req.body) {
      user[field] = req.body[field];
    }
  }

  await db.write();
  res.json({ user: publicUser(user), message: "Profile updated successfully." });
});

// Update salary structure (admin only)
router.put("/:id/salary", requireAuth, requireAdmin, async (req, res) => {
  await db.read();
  const { id } = req.params;
  const user = db.data.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Employee not found." });

  const { basic, hra, allowances, deductions } = req.body || {};
  user.salary = {
    basic: Number(basic) || 0,
    hra: Number(hra) || 0,
    allowances: Number(allowances) || 0,
    deductions: Number(deductions) || 0,
    currency: user.salary?.currency || "INR",
  };

  await db.write();
  res.json({ user: publicUser(user), message: "Salary structure updated." });
});

export default router;
