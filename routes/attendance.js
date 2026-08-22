import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 8);
}

function startOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  return new Date(d.setDate(diff));
}

// Get attendance (self, or any employee if admin passes userId query)
router.get("/", requireAuth, async (req, res) => {
  await db.read();
  const targetId = req.query.userId || req.user.id;

  if (req.user.role !== "admin" && targetId !== req.user.id) {
    return res.status(403).json({ message: "You can only view your own attendance." });
  }

  let records = db.data.attendance.filter((a) => a.userId === targetId);

  if (req.query.range === "week") {
    const monday = startOfWeek(todayISO());
    const mondayStr = monday.toISOString().slice(0, 10);
    records = records.filter((r) => r.date >= mondayStr);
  } else if (req.query.date) {
    records = records.filter((r) => r.date === req.query.date);
  }

  records.sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json({ attendance: records });
});

// Admin: view all attendance records (optionally filtered by date)
router.get("/all", requireAuth, requireAdmin, async (req, res) => {
  await db.read();
  let records = db.data.attendance;
  if (req.query.date) {
    records = records.filter((r) => r.date === req.query.date);
  }
  const withNames = records.map((r) => {
    const u = db.data.users.find((usr) => usr.id === r.userId);
    return { ...r, employeeName: u?.name || "Unknown", employeeCode: u?.employeeId || "" };
  });
  withNames.sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json({ attendance: withNames });
});

// Check in
router.post("/check-in", requireAuth, async (req, res) => {
  await db.read();
  const date = todayISO();
  let record = db.data.attendance.find((a) => a.userId === req.user.id && a.date === date);

  if (record && record.checkIn) {
    return res.status(400).json({ message: "You've already checked in today." });
  }

  if (!record) {
    record = {
      id: nanoid(),
      userId: req.user.id,
      date,
      status: "Present",
      checkIn: nowTime(),
      checkOut: null,
    };
    db.data.attendance.push(record);
  } else {
    record.checkIn = nowTime();
    record.status = "Present";
  }

  await db.write();
  res.json({ attendance: record, message: "Checked in successfully." });
});

// Check out
router.post("/check-out", requireAuth, async (req, res) => {
  await db.read();
  const date = todayISO();
  const record = db.data.attendance.find((a) => a.userId === req.user.id && a.date === date);

  if (!record || !record.checkIn) {
    return res.status(400).json({ message: "You need to check in before checking out." });
  }
  if (record.checkOut) {
    return res.status(400).json({ message: "You've already checked out today." });
  }

  record.checkOut = nowTime();

  const inHour = parseInt(record.checkIn.split(":")[0], 10);
  const outHour = parseInt(record.checkOut.split(":")[0], 10);
  if (outHour - inHour < 4) {
    record.status = "Half-day";
  }

  await db.write();
  res.json({ attendance: record, message: "Checked out successfully." });
});

export default router;
