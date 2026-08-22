import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "data", "db.json");

const defaultData = { users: [], attendance: [], leaves: [] };

const adapter = new JSONFile(file);
export const db = new Low(adapter, defaultData);

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function initDb() {
  await db.read();
  db.data ||= defaultData;

  if (db.data.users.length === 0) {
    const pwHash = bcrypt.hashSync("Password@123", 10);

    const admin = {
      id: nanoid(),
      employeeId: "DF-ADM-001",
      name: "Ananya Rao",
      email: "admin@dayflow.io",
      password: pwHash,
      role: "admin",
      department: "Human Resources",
      designation: "HR Manager",
      phone: "+91 90000 11111",
      address: "12 Residency Road, Bengaluru, KA",
      dateOfJoining: "2021-03-15",
      profilePicture: null,
      salary: {
        basic: 85000,
        hra: 34000,
        allowances: 12000,
        deductions: 9500,
        currency: "INR",
      },
      createdAt: new Date().toISOString(),
    };

    const emp1 = {
      id: nanoid(),
      employeeId: "DF-EMP-101",
      name: "Rohan Mehta",
      email: "rohan@dayflow.io",
      password: pwHash,
      role: "employee",
      department: "Engineering",
      designation: "Software Engineer II",
      phone: "+91 90000 22222",
      address: "45 MG Road, Bengaluru, KA",
      dateOfJoining: "2022-07-01",
      profilePicture: null,
      salary: {
        basic: 62000,
        hra: 24800,
        allowances: 8000,
        deductions: 6200,
        currency: "INR",
      },
      createdAt: new Date().toISOString(),
    };

    const emp2 = {
      id: nanoid(),
      employeeId: "DF-EMP-102",
      name: "Sneha Kulkarni",
      email: "sneha@dayflow.io",
      password: pwHash,
      role: "employee",
      department: "Design",
      designation: "Product Designer",
      phone: "+91 90000 33333",
      address: "8 Indiranagar, Bengaluru, KA",
      dateOfJoining: "2023-01-10",
      profilePicture: null,
      salary: {
        basic: 54000,
        hra: 21600,
        allowances: 6000,
        deductions: 5400,
        currency: "INR",
      },
      createdAt: new Date().toISOString(),
    };

    const emp3 = {
      id: nanoid(),
      employeeId: "DF-EMP-103",
      name: "Arjun Nair",
      email: "arjun@dayflow.io",
      password: pwHash,
      role: "employee",
      department: "Sales",
      designation: "Account Executive",
      phone: "+91 90000 44444",
      address: "3 Koramangala, Bengaluru, KA",
      dateOfJoining: "2023-09-20",
      profilePicture: null,
      salary: {
        basic: 48000,
        hra: 19200,
        allowances: 5000,
        deductions: 4800,
        currency: "INR",
      },
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(admin, emp1, emp2, emp3);

    // Seed attendance for the past 6 days for each employee
    const statuses = ["Present", "Present", "Present", "Half-day", "Present", "Absent"];
    for (const u of [emp1, emp2, emp3]) {
      for (let i = 6; i >= 1; i--) {
        const status = statuses[(i + u.employeeId.length) % statuses.length];
        db.data.attendance.push({
          id: nanoid(),
          userId: u.id,
          date: todayISO(-i),
          status,
          checkIn: status === "Absent" ? null : "09:2" + (i % 10) + ":00",
          checkOut: status === "Absent" ? null : "18:1" + (i % 10) + ":00",
        });
      }
    }

    // Seed a couple of leave requests
    db.data.leaves.push(
      {
        id: nanoid(),
        userId: emp1.id,
        type: "Sick",
        startDate: todayISO(2),
        endDate: todayISO(3),
        remarks: "Fever and flu, need rest to recover.",
        status: "Pending",
        adminComment: "",
        appliedOn: new Date().toISOString(),
      },
      {
        id: nanoid(),
        userId: emp2.id,
        type: "Paid",
        startDate: todayISO(-10),
        endDate: todayISO(-8),
        remarks: "Family function out of town.",
        status: "Approved",
        adminComment: "Enjoy, approved.",
        appliedOn: todayISO(-14),
      }
    );

    await db.write();
  }
}

export function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}
