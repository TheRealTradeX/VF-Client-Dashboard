import { AccountDetailsView } from "@/components/accounts/account-details-view";
import {
  accounts,
  credentialsByAccountId,
  getAccountRouteId,
  journalEntries,
  rulesByAccountId,
  trades,
} from "@/lib/mockData";
import { notFound } from "next/navigation";

type AccountDetailsPageProps = {
  params: { id: string };
};

export default function AccountDetailsPage({ params }: AccountDetailsPageProps) {
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  let routeId = rawId ?? "";
  try {
    routeId = decodeURIComponent(routeId);
  } catch {
    // keep raw route id if decode fails
  }
  const normalize = (value: string) => value.toString().toLowerCase().trim();

  const account =
    accounts.find((acct) => {
      const routeKey = getAccountRouteId(acct);
      return normalize(routeKey) === normalize(routeId) || normalize(acct.id) === normalize(routeId);
    }) ?? accounts[0];

  const accountTrades = trades.filter((trade) => trade.accountId === account.id);
  const accountJournal = journalEntries.filter((entry) => entry.accountId === account.id);
  const rules = rulesByAccountId[account.id];
  const credentials = credentialsByAccountId[account.id];

  return (
    <div className="p-6">
      <AccountDetailsView
        account={account}
        trades={accountTrades}
        journalEntries={accountJournal}
        rules={rules}
        credentials={credentials}
      />
    </div>
  );
}
