import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Pencil, Check, X } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Input, PageHeader, Avatar, Badge } from "../components/ui";
import { formatCurrency, formatDate } from "../utils/format";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const targetId = id || currentUser.id;
  const isSelf = targetId === currentUser.id;
  const isAdmin = currentUser.role === "admin";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/employees/${targetId}`);
      setProfile(res.data.user);
      setForm(res.data.user);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    setEditing(false);
    setMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = isAdmin
        ? {
            name: form.name,
            phone: form.phone,
            address: form.address,
            department: form.department,
            designation: form.designation,
            dateOfJoining: form.dateOfJoining,
            profilePicture: form.profilePicture,
          }
        : { phone: form.phone, address: form.address, profilePicture: form.profilePicture };

      const res = await api.put(`/employees/${targetId}`, payload);
      setProfile(res.data.user);
      setMessage("Profile updated successfully.");
      setEditing(false);
      if (isSelf) updateUser(res.data.user);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-ink-400">Loading profile…</div>;
  }
  if (error && !profile) {
    return <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>;
  }
  if (!profile) return null;

  const canEditAll = isAdmin;
  const canEditLimited = isSelf || isAdmin;

  return (
    <div>
      <PageHeader
        eyebrow={isSelf ? "My profile" : "Employee profile"}
        title={profile.name}
        description={`${profile.designation} · ${profile.department}`}
        actions={
          canEditLimited &&
          (editing ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setEditing(false); setForm(profile); }}>
                <X size={16} /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Check size={16} /> {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={16} /> Edit profile
            </Button>
          ))
        }
      />

      {message && (
        <p className="mb-6 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3.5 py-2.5">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Photo & identity */}
        <Card className="lg:col-span-1 flex flex-col items-center text-center">
          <div className="relative">
            <Avatar name={profile.name} src={editing ? form.profilePicture : profile.profilePicture} size={96} />
            {editing && (
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-700 text-white shadow-soft hover:bg-indigo-800">
                <Camera size={15} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
          <h3 className="mt-4 font-display font-semibold text-ink-900">{profile.name}</h3>
          <p className="text-sm text-ink-500">{profile.employeeId}</p>
          <div className="mt-3">
            <Badge tone={profile.role === "admin" ? "indigo" : "slate"}>
              {profile.role === "admin" ? "HR / Admin" : "Employee"}
            </Badge>
          </div>
          <div className="mt-6 w-full pt-5 border-t border-ink-100 text-left space-y-2.5">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Joined" value={formatDate(profile.dateOfJoining)} />
          </div>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-display font-semibold text-ink-900 mb-4">Personal details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {editing && canEditAll ? (
                <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              ) : (
                <ReadField label="Full name" value={profile.name} />
              )}
              {editing ? (
                <Input
                  label="Phone number"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 90000 00000"
                />
              ) : (
                <ReadField label="Phone number" value={profile.phone || "Not added yet"} />
              )}
              <ReadField label="Email address" value={profile.email} className="sm:col-span-2" />
              {editing ? (
                <Input
                  label="Address"
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="sm:col-span-2"
                  placeholder="Street, city, state"
                />
              ) : (
                <ReadField label="Address" value={profile.address || "Not added yet"} className="sm:col-span-2" />
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-semibold text-ink-900 mb-4">Job details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {editing && canEditAll ? (
                <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              ) : (
                <ReadField label="Department" value={profile.department} />
              )}
              {editing && canEditAll ? (
                <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              ) : (
                <ReadField label="Designation" value={profile.designation} />
              )}
              {editing && canEditAll ? (
                <Input
                  label="Date of joining"
                  type="date"
                  value={form.dateOfJoining}
                  onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })}
                />
              ) : (
                <ReadField label="Date of joining" value={formatDate(profile.dateOfJoining)} />
              )}
              <ReadField label="Employee ID" value={profile.employeeId} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-ink-900">Salary structure</h3>
              <Badge tone="slate">Read-only</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <ReadField label="Basic pay" value={formatCurrency(profile.salary?.basic, profile.salary?.currency)} />
              <ReadField label="HRA" value={formatCurrency(profile.salary?.hra, profile.salary?.currency)} />
              <ReadField label="Allowances" value={formatCurrency(profile.salary?.allowances, profile.salary?.currency)} />
              <ReadField label="Deductions" value={formatCurrency(profile.salary?.deductions, profile.salary?.currency)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-800 truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function ReadField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-ink-500 mb-1">{label}</p>
      <p className="text-sm text-ink-900">{value}</p>
    </div>
  );
}
