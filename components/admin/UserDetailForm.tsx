"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserDetailInitial = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  username: string;
  mobilePhone: string;
  language: string;
  role: string;
  userType: number | null;
  systemAccess: number | null;
  platformUserId: string | null;
  platformStatus: string | null;
  inviteUrl: string | null;
};

type UserDetailFormProps = {
  userId: string;
  initial: UserDetailInitial;
};

const userTypeOptions = [
  { value: "", label: "Select" },
  { value: "0", label: "User (0)" },
  { value: "1", label: "System (1)" },
];

const systemAccessOptions = [
  { value: "", label: "Select" },
  { value: "0", label: "Read Only (0)" },
  { value: "1", label: "Liquidation (1)" },
  { value: "2", label: "Full Trading (2)" },
];

export function UserDetailForm({ userId, initial }: UserDetailFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initial.email);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [country, setCountry] = useState(initial.country);
  const [username, setUsername] = useState(initial.username);
  const [mobilePhone, setMobilePhone] = useState(initial.mobilePhone);
  const [language, setLanguage] = useState(initial.language);
  const [role, setRole] = useState(initial.role || "trader");
  const [userType, setUserType] = useState(
    initial.userType === null || Number.isNaN(initial.userType) ? "" : String(initial.userType),
  );
  const [systemAccess, setSystemAccess] = useState(
    initial.systemAccess === null || Number.isNaN(initial.systemAccess)
      ? ""
      : String(initial.systemAccess),
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          country: country.trim(),
          username: username.trim() || null,
          mobilePhone: mobilePhone.trim() || null,
          language: language.trim() || null,
          role,
          userType: userType === "" ? null : Number.parseInt(userType, 10),
          systemAccess: systemAccess === "" ? null : Number.parseInt(systemAccess, 10),
          password: password.trim() || undefined,
        }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Update failed.");
      }

      setPassword("");
      setNotice("User updated.");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Remove this user from Velocity? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Remove failed.");
      }
      router.push("/admin/users");
    } catch (error) {
      setNotice((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-white text-lg mb-1">User</h2>
          <p className="text-sm text-zinc-500">Update identity, role, and trading platform access.</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={loading}
          className="px-3 py-1.5 text-xs text-white border border-red-500/60 rounded-lg hover:border-red-400 disabled:opacity-60"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">First name</label>
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Last name</label>
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Country</label>
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Username (optional)</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Mobile phone</label>
          <input
            value={mobilePhone}
            onChange={(event) => setMobilePhone(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Language</label>
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Role</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="trader">Trader</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">User type</label>
          <select
            value={userType}
            onChange={(event) => setUserType(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            {userTypeOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">System access</label>
          <select
            value={systemAccess}
            onChange={(event) => setSystemAccess(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            {systemAccessOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Password to set (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-500">
        <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 px-3 py-2">
          Trading Platform ID: <span className="text-zinc-300">{initial.platformUserId ?? "Not linked"}</span>
        </div>
        <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 px-3 py-2">
          Platform Status: <span className="text-zinc-300">{initial.platformStatus ?? "-"}</span>
        </div>
        <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 px-3 py-2 truncate">
          Invite URL:{" "}
          <span className="text-zinc-300">{initial.inviteUrl ? "Available" : "Not available"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
      </div>
    </form>
  );
}
