import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDataMode } from "@/lib/data-mode";
import { getAuthenticatedSupabaseUser, listSubscriptionsByUserIds, listTraderAccounts } from "@/lib/volumetrica/trader-data";
import { TRADING_PLATFORM_LABEL } from "@/lib/platform-labels";

export default async function SubscriptionsPage() {
  const mode = getDataMode();

  if (mode === "mock") {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-white text-2xl mb-1">Subscriptions</h1>
          <p className="text-zinc-400">Manage your data subscription and platform access</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          Subscriptions are not connected in mock mode.
        </div>
      </div>
    );
  }

  const user = await getAuthenticatedSupabaseUser();
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-white">Not signed in.</div>
      </div>
    );
  }

  const accounts = await listTraderAccounts(user);
  const userIds = Array.from(
    new Set(
      accounts
        .flatMap((account) => [account.user_id, account.owner_organization_user_id])
        .filter((id): id is string => typeof id === "string"),
    ),
  );

  const subscriptions = await listSubscriptionsByUserIds(userIds);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Subscriptions</h1>
        <p className="text-zinc-400">Your current data subscription status from {TRADING_PLATFORM_LABEL} updates</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">No subscriptions found.</div>
          <div className="text-sm text-zinc-500">
            Waiting for subscription updates. If you have accounts but no subscriptions, confirm your {TRADING_PLATFORM_LABEL} is
            sending subscription updates.
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900">
                <TableHead className="text-zinc-400">Subscription</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Activation</TableHead>
                <TableHead className="text-zinc-400">Expiration</TableHead>
                <TableHead className="text-zinc-400">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub, index) => (
                <TableRow key={sub.subscription_id} className="border-zinc-900">
                  <TableCell className="text-white">{`Subscription ${index + 1}`}</TableCell>
                  <TableCell className="text-zinc-300">{sub.status ?? "-"}</TableCell>
                  <TableCell className="text-zinc-300">{sub.activation?.slice(0, 16).replace("T", " ") ?? "-"}</TableCell>
                  <TableCell className="text-zinc-300">
                    {sub.expiration?.slice(0, 16).replace("T", " ") ?? "-"}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {sub.volumetrica_download_link ? (
                      <Link
                        href={sub.volumetrica_download_link}
                        target="_blank"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        Download
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
