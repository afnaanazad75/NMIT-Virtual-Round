import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { FullPageLoader } from "./components/ui";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Employees from "./pages/admin/Employees";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminLeave from "./pages/admin/AdminLeave";
import AdminPayroll from "./pages/admin/AdminPayroll";

function RoleDashboard() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}

function RoleAttendance() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminAttendance /> : <Attendance />;
}

function RoleLeave() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminLeave /> : <Leave />;
}

function RolePayroll() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminPayroll /> : <Payroll />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <FullPageLoader />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute adminOnly>
            <Employees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <RoleAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <RoleLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <RolePayroll />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
