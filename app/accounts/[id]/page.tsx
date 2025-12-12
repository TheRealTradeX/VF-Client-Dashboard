import Link from "next/link";
import {
  mockAccounts,
  trades as baseTrades,
  journalEntries as baseJournal,
  rulesByAccountId,
  credentialsByAccountId,
  normalizeAccounts,
  getAccountRouteId,
} from "@/lib/mockData";
import { AccountDetailsView } from "@/components/accounts/account-details-view";

export default function AccountDetailsPage({ params }: { params: { id: string } }) {
  const raw = params.id ?? "";
  const routeId = decodeURIComponent(raw).trim();
  const accounts = normalizeAccounts(mockAccounts);
  const account = accounts.find((a) => getAccountRouteId(a) === routeId);

  if (!account) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl text-white">Account not found</h1>
        <p className="text-zinc-400">
          We couldn&apos;t locate an account with ID: <code className="text-white">{routeId}</code>
        </p>
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-600 transition-colors"
        >
          Back to Accounts
        </Link>
      </div>
    );
  }

  const accountTrades = baseTrades.filter((t) => t.accountId === getAccountRouteId(account));
  const accountJournal = baseJournal.filter((j) => j.accountId === getAccountRouteId(account));
  const rules = rulesByAccountId[getAccountRouteId(account)];
  const creds = credentialsByAccountId[getAccountRouteId(account)];

  return (
    <div className="p-6 pb-10">
      <AccountDetailsView
        account={account}
        trades={accountTrades}
        journalEntries={accountJournal}
        rules={rules}
        credentials={creds}
      />
    </div>
  );
}
