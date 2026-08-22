import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { Card, PageHeader, EmptyState, Avatar, Badge, Input } from "../../components/ui";
import { formatDate } from "../../utils/format";

export default function Employees() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get("/employees")
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.employeeId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Employees"
        description="View and manage every profile registered on Dayflow."
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID, or department"
            className="w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="px-6 py-8 text-sm text-ink-400">Loading employees…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Try a different search term." />
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/employees/${u.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-ink-50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar name={u.name} src={u.profilePicture} size={40} />
                    <div>
                      <p className="text-sm font-medium text-ink-800">{u.name}</p>
                      <p className="text-xs text-ink-500">
                        {u.employeeId} · {u.designation}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6">
                    <span className="text-xs text-ink-500">{u.department}</span>
                    <span className="text-xs text-ink-400">Joined {formatDate(u.dateOfJoining)}</span>
                    <Badge tone={u.role === "admin" ? "indigo" : "slate"}>
                      {u.role === "admin" ? "HR / Admin" : "Employee"}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
