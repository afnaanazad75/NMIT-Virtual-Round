import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  UserRound,
  CalendarCheck,
  FileClock,
  Wallet,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/ui";

const employeeNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/profile", label: "My Profile", icon: UserRound },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/leave", label: "Leave Requests", icon: FileClock },
  { to: "/payroll", label: "Payroll", icon: Wallet },
];

const adminNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/leave", label: "Leave Approvals", icon: FileClock },
  { to: "/payroll", label: "Payroll", icon: Wallet },
  { to: "/profile", label: "My Profile", icon: UserRound },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = user?.role === "admin" ? adminNav : employeeNav;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white font-display font-bold text-sm">
          D
        </div>
        <span className="font-display text-lg font-bold text-ink-900">Dayflow</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              }`
            }
          >
            <item.icon size={18} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-ink-100">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name} src={user?.profilePicture} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-500">{user?.designation}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:flex-col bg-white border-r border-ink-100">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white font-display font-bold text-xs">
            D
          </div>
          <span className="font-display text-base font-bold text-ink-900">Dayflow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-lift">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
