import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/mockData";
import { resolveMode } from "@/lib/volumetrica/admin-format";

type AccountRow = {
  status: string | null;
  snapshot: Record<string, unknown> | null;
  raw: Record<string, unknown> | null;
  updated_at: string;
};

type PayoutRow = {
  amount: number | null;
  status: string;
  paid_at: string | null;
};

const getMonthStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

const isPassStatus = (status: string | null) => {
  const normalized = (status ?? "").toLowerCase();
  return normalized.includes("success") || normalized.includes("passed");
};

const isFailStatus = (status: string | null) => {
  const normalized = (status ?? "").toLowerCase();
  return normalized.includes("fail") || normalized.includes("breach");
};

const isFundedMode = (account: AccountRow) => {
  const mode = resolveMode(account);
  return mode.toLowerCase().includes("funded");
};

export default async function AdminAnalyticsPage() {
  const supabase = createSupabaseAdminClient();
  const monthStart = getMonthStartUtc().toISOString();

  const { data: accountsData } = await supabase
    .from("volumetrica_accounts")
    .select("status,snapshot,raw,updated_at")
    .eq("is_deleted", false)
    .gte("updated_at", monthStart);

  const { data: payoutsData } = await supabase
    .from("payout_requests")
    .select("amount,status,paid_at")
    .gte("requested_at", monthStart);

  const accounts = (accountsData as AccountRow[] | null) ?? [];
  const payouts = (payoutsData as PayoutRow[] | null) ?? [];

  const passCount = accounts.filter((account) => isPassStatus(account.status)).length;
  const failCount = accounts.filter((account) => isFailStatus(account.status)).length;
  const fundedCount = accounts.filter((account) => isFundedMode(account)).length;

  const payoutVolume = payouts
    .filter((payout) => payout.status === "paid")
    .reduce((sum, payout) => sum + (payout.amount ?? 0), 0);

  const metrics = [
    { label: "Pass Count (MTD)", value: String(passCount) },
    { label: "Fail Count (MTD)", value: String(failCount) },
    { label: "Funded Conversions (MTD)", value: String(fundedCount) },
    { label: "Payout Volume (MTD)", value: formatCurrency(payoutVolume) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Analytics</h1>
        <p className="text-zinc-400">Month-to-date operational metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <div className="text-sm text-zinc-400 mb-2">{metric.label}</div>
            <div className="text-2xl text-white mb-1">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
