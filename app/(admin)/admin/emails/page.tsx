import { EmailTemplateCard, EmailTemplateCreateForm } from "@/components/admin/EmailTemplateManager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type EmailTemplateRow = {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  updated_at: string;
};

type OutboxRow = {
  id: string;
  template_id: string | null;
  to_email: string;
  subject: string;
  status: string;
  provider: string;
  error: string | null;
  created_at: string;
  sent_at: string | null;
};

const formatTimestamp = (value: string | null) => (value ? value.replace("T", " ").slice(0, 19) : "-");

export default async function AdminEmailsPage() {
  const supabase = createSupabaseAdminClient();
  const isProd = process.env.VERCEL_ENV === "production";

  const { data: templates, error: templateError } = await supabase
    .from("email_templates")
    .select("id, template_key, name, subject, body, is_active, updated_at")
    .order("updated_at", { ascending: false });

  const { data: outbox } = await supabase
    .from("email_outbox")
    .select("id, template_id, to_email, subject, status, provider, error, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const templateRows = (templates as EmailTemplateRow[] | null) ?? [];
  const outboxRows = (outbox as OutboxRow[] | null) ?? [];
  const templateMap = new Map(templateRows.map((row) => [row.id, row]));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Email Templates</h1>
        <p className="text-zinc-400">Manage transactional templates and track sends.</p>
      </div>

      <EmailTemplateCreateForm />

      <div className="space-y-4">
        {templateRows.map((template) => (
          <EmailTemplateCard key={template.id} template={template} isProd={isProd} />
        ))}
        {!templateRows.length && (
          <div className="text-sm text-zinc-400">
            {templateError ? "Unable to load templates." : "No templates created yet."}
          </div>
        )}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-900">
          <h2 className="text-white text-sm">Outbox Log</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Template</TableHead>
              <TableHead className="text-zinc-400">Recipient</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Provider</TableHead>
              <TableHead className="text-zinc-400">Created</TableHead>
              <TableHead className="text-zinc-400 text-right">Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outboxRows.map((row) => {
              const template = row.template_id ? templateMap.get(row.template_id) : null;
              return (
                <TableRow key={row.id} className="border-zinc-900">
                  <TableCell className="text-zinc-300">
                    <div className="text-white text-sm">{template?.name ?? "Manual send"}</div>
                    <div className="text-xs text-zinc-500">{template?.template_key ?? "-"}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.to_email}</TableCell>
                  <TableCell className="text-zinc-300">{row.status}</TableCell>
                  <TableCell className="text-zinc-300">{row.provider}</TableCell>
                  <TableCell className="text-zinc-300">{formatTimestamp(row.created_at)}</TableCell>
                  <TableCell className="text-right text-zinc-300">{formatTimestamp(row.sent_at)}</TableCell>
                </TableRow>
              );
            })}
            {!outboxRows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={6}>
                  No outbox activity yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
