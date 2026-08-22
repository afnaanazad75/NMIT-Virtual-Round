import { useEffect, useState } from "react";
import { FileClock, Check, X } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { Card, Badge, statusTone, Button, PageHeader, EmptyState, Modal, Textarea } from "../../components/ui";
import { formatDate, formatDateTime } from "../../utils/format";

const filters = ["All", "Pending", "Approved", "Rejected"];

export default function AdminLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Pending");
  const [reviewing, setReviewing] = useState(null); // { leave, decision }
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  function openReview(leave, decision) {
    setReviewing({ leave, decision });
    setComment(leave.adminComment || "");
  }

  async function submitReview() {
    setSubmitting(true);
    try {
      await api.put(`/leave/${reviewing.leave.id}`, {
        status: reviewing.decision,
        adminComment: comment,
      });
      setReviewing(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filter === "All" ? leaves : leaves.filter((l) => l.status === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Time off"
        title="Leave approvals"
        description="Review, approve, or reject leave requests from your team."
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="flex gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-indigo-700 text-white"
                : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="px-6 py-8 text-sm text-ink-400">Loading requests…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileClock} title="Nothing to review" description="No leave requests match this filter." />
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((l) => (
              <li key={l.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">
                    {l.employeeName} <span className="text-ink-400 font-normal">· {l.employeeCode}</span>
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {l.type} leave · {formatDate(l.startDate)} – {formatDate(l.endDate)} · Applied{" "}
                    {formatDateTime(l.appliedOn)}
                  </p>
                  {l.remarks && <p className="text-xs text-ink-500 mt-1">"{l.remarks}"</p>}
                  {l.adminComment && (
                    <p className="text-xs text-indigo-700 mt-1">HR note: {l.adminComment}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                  {l.status === "Pending" && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => openReview(l, "Rejected")}>
                        <X size={14} /> Reject
                      </Button>
                      <Button size="sm" onClick={() => openReview(l, "Approved")}>
                        <Check size={14} /> Approve
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={reviewing?.decision === "Approved" ? "Approve leave request" : "Reject leave request"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button
              variant={reviewing?.decision === "Rejected" ? "danger" : "primary"}
              onClick={submitReview}
              disabled={submitting}
            >
              {submitting ? "Saving…" : `Confirm ${reviewing?.decision === "Approved" ? "approval" : "rejection"}`}
            </Button>
          </>
        }
      >
        {reviewing && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              {reviewing.leave.employeeName} · {reviewing.leave.type} leave ·{" "}
              {formatDate(reviewing.leave.startDate)} – {formatDate(reviewing.leave.endDate)}
            </p>
            <Textarea
              label="Comment (optional)"
              rows={3}
              placeholder="Add a note for the employee"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
