import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { Card, Badge, statusTone, Button, PageHeader, EmptyState } from "../components/ui";
import { formatDate, todayISO } from "../utils/format";

export default function Attendance() {
  const [range, setRange] = useState("week");
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = range === "day" ? { date: todayISO() } : { range: "week" };
      const res = await api.get("/attendance", { params });
      setRecords(res.data.attendance);
      const todayRecord = res.data.attendance.find((r) => r.date === todayISO());
      if (todayRecord) setToday(todayRecord);
      else if (range === "day") setToday(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function handleCheckIn() {
    setActionLoading(true);
    try {
      await api.post("/attendance/check-in");
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setActionLoading(true);
    try {
      await api.post("/attendance/check-out");
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Attendance"
        title="My attendance"
        description="Track your daily check-ins and review your attendance history."
        actions={
          <div className="flex gap-3">
            {!today?.checkIn && (
              <Button onClick={handleCheckIn} disabled={actionLoading}>
                <Clock size={16} /> Check in
              </Button>
            )}
            {today?.checkIn && !today?.checkOut && (
              <Button variant="secondary" onClick={handleCheckOut} disabled={actionLoading}>
                Check out
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="flex gap-2 mb-5">
        {[
          { key: "day", label: "Today" },
          { key: "week", label: "This week" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setRange(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              range === t.key
                ? "bg-indigo-700 text-white"
                : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="px-6 py-8 text-sm text-ink-400">Loading attendance…</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance records"
            description="Records for this period will appear here once you check in."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Check in</th>
                <th className="px-6 py-3.5">Check out</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3.5 font-medium text-ink-800">{formatDate(r.date)}</td>
                  <td className="px-6 py-3.5 text-ink-600">{r.checkIn || "—"}</td>
                  <td className="px-6 py-3.5 text-ink-600">{r.checkOut || "—"}</td>
                  <td className="px-6 py-3.5">
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
