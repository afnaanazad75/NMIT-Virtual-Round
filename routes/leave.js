import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Get leave requests (self, or all if admin)
router.get("/", requireAuth, async (req, res) => {
  await db.read();

  if (req.user.role === "admin") {
    const all = db.data.leaves.map((l) => {
      const u = db.data.users.find((usr) => usr.id === l.userId);
      return { ...l, employeeName: u?.name || "Unknown", employeeCode: u?.employeeId || "" };
    });
    all.sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1));
    return res.json({ leaves: all });
  }

  const mine = db.data.leaves.filter((l) => l.userId === req.user.id);
  mine.sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1));
  res.json({ leaves: mine });
});

// Apply for leave
router.post("/", requireAuth, async (req, res) => {
  const { type, startDate, endDate, remarks } = req.body || {};

  if (!type || !startDate || !endDate) {
    return res.status(400).json({ message: "Please select a leave type and date range." });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ message: "End date cannot be before the start date." });
  }

  await db.read();
  const newLeave = {
    id: nanoid(),
    userId: req.user.id,
    type,
    startDate,
    endDate,
    remarks: remarks || "",
    status: "Pending",
    adminComment: "",
    appliedOn: new Date().toISOString(),
  };

  db.data.leaves.push(newLeave);
  await db.write();

  res.status(201).json({ leave: newLeave, message: "Leave request submitted." });
});

// Approve / reject a leave request (admin only)
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  await db.read();
  const { id } = req.params;
  const { status, adminComment } = req.body || {};

  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const leave = db.data.leaves.find((l) => l.id === id);
  if (!leave) return res.status(404).json({ message: "Leave request not found." });

  leave.status = status;
  leave.adminComment = adminComment || "";

  await db.write();
  res.json({ leave, message: `Leave request ${status.toLowerCase()}.` });
});

export default router;
