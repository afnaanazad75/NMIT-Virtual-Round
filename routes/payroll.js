import { Router } from "express";
import { db, publicUser } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

function computeNet(salary) {
  const s = salary || { basic: 0, hra: 0, allowances: 0, deductions: 0 };
  const gross = (s.basic || 0) + (s.hra || 0) + (s.allowances || 0);
  const net = gross - (s.deductions || 0);
  return { gross, net };
}

// Admin: payroll overview of all employees
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  await db.read();
  const rows = db.data.users.map((u) => {
    const { gross, net } = computeNet(u.salary);
    return {
      id: u.id,
      employeeId: u.employeeId,
      name: u.name,
      department: u.department,
      designation: u.designation,
      salary: u.salary,
      gross,
      net,
    };
  });
  res.json({ payroll: rows });
});

// Self: read-only payslip
router.get("/me", requireAuth, async (req, res) => {
  await db.read();
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Account not found." });
  const { gross, net } = computeNet(user.salary);
  res.json({ salary: user.salary, gross, net });
});

// Admin dashboard analytics
router.get("/analytics/overview", requireAuth, requireAdmin, async (req, res) => {
  await db.read();
  const totalEmployees = db.data.users.filter((u) => u.role === "employee").length;
  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = db.data.attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === "Present").length;
  const pendingLeaves = db.data.leaves.filter((l) => l.status === "Pending").length;
  const totalPayroll = db.data.users.reduce((sum, u) => sum + computeNet(u.salary).net, 0);

  res.json({
    totalEmployees,
    presentToday,
    pendingLeaves,
    totalPayroll,
  });
});

export default router;
