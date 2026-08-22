import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { Card, PageHeader, Badge } from "../components/ui";
import { formatCurrency, formatDate, todayISO } from "../utils/format";

export default function Payroll() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/payroll/me")
      .then((res) => setData(res.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Payroll"
        title="My payroll"
        description="A read-only view of your current salary structure."
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-ink-400">Loading payroll…</p>
      ) : data ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-ink-900">Salary breakup</h3>
              <Badge tone="slate">As of {formatDate(todayISO())}</Badge>
            </div>
            <div className="divide-y divide-ink-100">
              <Row label="Basic pay" value={formatCurrency(data.salary.basic, data.salary.currency)} />
              <Row label="House rent allowance" value={formatCurrency(data.salary.hra, data.salary.currency)} />
              <Row label="Other allowances" value={formatCurrency(data.salary.allowances, data.salary.currency)} />
              <Row
                label="Deductions"
                value={`− ${formatCurrency(data.salary.deductions, data.salary.currency)}`}
                negative
              />
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 mb-4">
              <Wallet size={22} />
            </div>
            <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Net monthly pay</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink-900">
              {formatCurrency(data.net, data.salary.currency)}
            </p>
            <p className="mt-3 text-xs text-ink-400">
              Gross: {formatCurrency(data.gross, data.salary.currency)}
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex items-center justify-between py-3.5 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className={`font-medium ${negative ? "text-rose-600" : "text-ink-800"}`}>{value}</span>
    </div>
  );
}
