import { useEffect, useState } from "react";
import { Wallet, Pencil } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { Card, PageHeader, EmptyState, Button, Modal, Input } from "../../components/ui";
import { formatCurrency } from "../../utils/format";

export default function AdminPayroll() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ basic: 0, hra: 0, allowances: 0, deductions: 0 });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/payroll");
      setRows(res.data.payroll);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openEdit(row) {
    setEditing(row);
    setForm({
      basic: row.salary?.basic || 0,
      hra: row.salary?.hra || 0,
      allowances: row.salary?.allowances || 0,
      deductions: row.salary?.deductions || 0,
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/employees/${editing.id}/salary`, form);
      setEditing(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const totalNet = rows.reduce((sum, r) => sum + (r.net || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Payroll"
        title="Payroll control"
        description="View and update salary structures for every employee."
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <Card className="mb-6 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <Wallet size={20} />
        </div>
        <div>
          <p className="text-xs text-ink-500">Total net monthly payroll</p>
          <p className="font-display text-xl font-bold text-ink-900">
            {loading ? "…" : formatCurrency(totalNet)}
          </p>
        </div>
      </Card>

      <Card padded={false}>
        {loading ? (
          <div className="px-6 py-8 text-sm text-ink-400">Loading payroll…</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Wallet} title="No payroll data" description="Employee salary records will appear here." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Basic</th>
                <th className="px-6 py-3.5">HRA</th>
                <th className="px-6 py-3.5">Allowances</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net pay</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-ink-800">{r.name}</p>
                    <p className="text-xs text-ink-500">{r.employeeId} · {r.department}</p>
                  </td>
                  <td className="px-6 py-3.5 text-ink-600">{formatCurrency(r.salary?.basic)}</td>
                  <td className="px-6 py-3.5 text-ink-600">{formatCurrency(r.salary?.hra)}</td>
                  <td className="px-6 py-3.5 text-ink-600">{formatCurrency(r.salary?.allowances)}</td>
                  <td className="px-6 py-3.5 text-rose-600">− {formatCurrency(r.salary?.deductions)}</td>
                  <td className="px-6 py-3.5 font-semibold text-ink-900">{formatCurrency(r.net)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                      <Pencil size={14} /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit salary · ${editing?.name || ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save salary"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Basic pay"
            type="number"
            min="0"
            value={form.basic}
            onChange={(e) => setForm({ ...form, basic: e.target.value })}
          />
          <Input
            label="HRA"
            type="number"
            min="0"
            value={form.hra}
            onChange={(e) => setForm({ ...form, hra: e.target.value })}
          />
          <Input
            label="Allowances"
            type="number"
            min="0"
            value={form.allowances}
            onChange={(e) => setForm({ ...form, allowances: e.target.value })}
          />
          <Input
            label="Deductions"
            type="number"
            min="0"
            value={form.deductions}
            onChange={(e) => setForm({ ...form, deductions: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
