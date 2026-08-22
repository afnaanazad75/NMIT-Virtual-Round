import { useEffect, useState } from "react";
import { FileClock, Plus } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { Card, Badge, statusTone, Button, PageHeader, EmptyState, Modal, Select, Input, Textarea } from "../components/ui";
import { formatDate, formatDateTime, todayISO } from "../utils/format";

const leaveTypes = ["Paid", "Sick", "Unpaid"];

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: "Paid", startDate: todayISO(), endDate: todayISO(), remarks: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/leave");
      setLeaves(res.data.leaves);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/leave", form);
      setModalOpen(false);
      setForm({ type: "Paid", startDate: todayISO(), endDate: todayISO(), remarks: "" });
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Time off"
        title="Leave requests"
        description="Apply for paid, sick, or unpaid leave and track approval status."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Apply for leave
          </Button>
        }
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <Card padded={false}>
        {loading ? (
          <div className="px-6 py-8 text-sm text-ink-400">Loading leave requests…</div>
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={FileClock}
            title="No leave requests yet"
            description="Apply for your first leave to see it tracked here."
            action={<Button onClick={() => setModalOpen(true)}>Apply for leave</Button>}
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {leaves.map((l) => (
              <li key={l.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink-800">
                    {l.type} leave · {formatDate(l.startDate)} – {formatDate(l.endDate)}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Applied {formatDateTime(l.appliedOn)}
                    {l.remarks && <> · {l.remarks}</>}
                  </p>
                  {l.adminComment && (
                    <p className="text-xs text-indigo-700 mt-1">HR note: {l.adminComment}</p>
                  )}
                </div>
                <Badge tone={statusTone(l.status)}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Apply for leave"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="leave-form" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </>
        }
      >
        <form id="leave-form" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {leaveTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="End date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <Textarea
            label="Remarks (optional)"
            rows={3}
            placeholder="Add any context for your manager"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
          {formError && (
            <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{formError}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}
