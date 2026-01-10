"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { renderTemplate } from "@/lib/email/render";

type EmailTemplateRow = {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  updated_at: string;
};

type EmailTemplateCardProps = {
  template: EmailTemplateRow;
  isProd: boolean;
};

export function EmailTemplateCreateForm() {
  const router = useRouter();
  const [templateKey, setTemplateKey] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateKey: templateKey.trim(),
          name: name.trim(),
          subject: subject.trim(),
          body,
          isActive,
        }),
      });

      const payload = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? "Request failed.");
      }

      setTemplateKey("");
      setName("");
      setSubject("");
      setBody("");
      setIsActive(true);
      setNotice("Template created.");
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
        <h2 className="text-white text-lg mb-1">Create Template</h2>
        <p className="text-sm text-zinc-500">Create a transactional template for admin-triggered emails.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Template key</label>
          <input
            value={templateKey}
            onChange={(event) => setTemplateKey(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="welcome.setup"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Welcome / Setup"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Subject</label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Welcome to Velocity Funds"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Body (HTML or text)</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white min-h-[160px]"
            placeholder="Hi {{firstName}}, ..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
          />
          Active
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Template"}
        </button>
        {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
      </div>
    </form>
  );
}

export function EmailTemplateCard({ template, isProd }: EmailTemplateCardProps) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [templateKey, setTemplateKey] = useState(template.template_key);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [isActive, setIsActive] = useState(template.is_active);
  const [toEmail, setToEmail] = useState("");
  const [variablesJson, setVariablesJson] = useState("{}");
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const variables = useMemo(() => {
    try {
      return JSON.parse(variablesJson) as Record<string, string>;
    } catch {
      return {};
    }
  }, [variablesJson]);

  const previewSubject = renderTemplate(subject, variables);
  const previewBody = renderTemplate(body, variables);

  const handleSave = async () => {
    setLoading("save");
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${template.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateKey: templateKey.trim(),
          name: name.trim(),
          subject: subject.trim(),
          body,
          isActive,
        }),
      });
      const payload = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? "Update failed.");
      }
      setNotice("Template updated.");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this template?")) return;
    setLoading("delete");
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${template.id}`, { method: "DELETE" });
      const payload = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? "Delete failed.");
      }
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleTestSend = async () => {
    if (isProd) {
      setNotice("Test send is disabled in production.");
      return;
    }
    if (!toEmail.trim()) {
      setNotice("Recipient email is required.");
      return;
    }
    setLoading("test");
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${template.id}/test-send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toEmail: toEmail.trim(), variables }),
      });
      const payload = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? "Test send failed.");
      }
      setNotice("Test send queued.");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-white text-lg">{template.name}</div>
          <div className="text-xs text-zinc-500">{template.template_key}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading !== null}
            className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50 disabled:opacity-60"
          >
            {loading === "save" ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading !== null}
            className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-rose-500/50 disabled:opacity-60"
          >
            {loading === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Template key</label>
          <input
            value={templateKey}
            onChange={(event) => setTemplateKey(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Subject</label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Body</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white min-h-[160px]"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
          />
          Active
        </label>
        {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
      </div>
      <div className="border-t border-zinc-900 pt-4 space-y-3">
        <div className="text-sm text-zinc-400">Preview</div>
        <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3 text-sm text-zinc-300">
          <div className="text-white text-sm mb-2">{previewSubject || "(empty subject)"}</div>
          <div className="text-xs whitespace-pre-wrap">{previewBody || "(empty body)"}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={toEmail}
            onChange={(event) => setToEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Test recipient"
          />
          <input
            value={variablesJson}
            onChange={(event) => setVariablesJson(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder='{"firstName":"Alex"}'
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleTestSend}
            disabled={loading !== null}
            className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-emerald-500/50 disabled:opacity-60"
          >
            {loading === "test" ? "Sending..." : "Test Send"}
          </button>
          {isProd && <span className="ml-2 text-xs text-zinc-500">Disabled in production.</span>}
        </div>
      </div>
    </div>
  );
}
