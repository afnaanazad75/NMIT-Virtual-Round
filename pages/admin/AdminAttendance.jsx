import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { Card, Badge, statusTone, PageHeader, EmptyState, Input } from "../../components/ui";
import { formatDate, todayISO } from "../../utils/format";

export default function AdminAttendance() {
  const [date, setDate] = useState(todayISO());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/attendance/all", { params: { date } })
      .then((res) => setRecords(res.data.attendance))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [date]);

  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;

  return (
    <div>
      <PageHeader
        eyebrow="Attendance"
        title="Attendance records"
        description="Review check-ins across the organization for any given day."
        actions={
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        }
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-2xl font-display font-bold text-ink-900">{loading ? "…" : records.length}</p>
          <p className="text-xs text-ink-500 mt-1">Total records for {formatDate(date)}</p>
        </Card>
        <Card>
          <p className="text-2xl font-display font-bold text-emerald-600">{loading ? "…" : presentCount}</p>
          <p className="text-xs text-ink-500 mt-1">Present</p>
        </Card>
        <Card>
          <p className="text-2xl font-display font-bold text-rose-600">{loading ? "…" : absentCount}</p>
          <p className="text-xs text-ink-500 mt-1">Absent</p>
        </Card>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="px-6 py-8 text-sm text-ink-400">Loading records…</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description="No check-ins were recorded for this date."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Check in</th>
                <th className="px-6 py-3.5">Check out</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-ink-800">{r.employeeName}</p>
                    <p className="text-xs text-ink-500">{r.employeeCode}</p>
                  </td>
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
