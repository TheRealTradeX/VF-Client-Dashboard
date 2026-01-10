"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserProvisionForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("trader");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim() || undefined,
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          country: country.trim(),
          username: username.trim() || undefined,
          password: password.trim() || undefined,
          role,
        }),
      });

      const body = (await res.json()) as { ok: boolean; error?: string; userId?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? "Request failed.");
      }

      setNotice(`User saved. Supabase id: ${body.userId ?? "n/a"}`);
      setUserId("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setCountry("");
      setUsername("");
      setPassword("");
      setRole("trader");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-white text-lg mb-1">User Provisioning</h2>
        <p className="text-sm text-zinc-500">
          Create or update users for the trading platform. Use the user id to update existing records.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Supabase user id (optional)</label>
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Use to update"
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
          <label className="text-sm text-zinc-400">First name</label>
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Last name</label>
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Last name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="name@company.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Country</label>
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Country"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Username (optional)</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Password (required for new users)</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Set initial password"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save User"}
        </button>
        {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
      </div>
    </form>
  );
}
