import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const payouts = [
  {
    id: "PO-9001",
    user: "Arlene McCoy",
    amount: "$4,200.00",
    status: "Approved",
    method: "Wire",
    requested: "2025-12-12",
  },
  {
    id: "PO-9002",
    user: "Jerome Bell",
    amount: "$1,550.00",
    status: "Processing",
    method: "ACH",
    requested: "2025-12-11",
  },
  {
    id: "PO-9003",
    user: "Robert Fox",
    amount: "$980.00",
    status: "On Hold",
    method: "Wire",
    requested: "2025-12-10",
  },
];

const statusStyles: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  Processing: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  "On Hold": "bg-amber-500/10 text-amber-400 border border-amber-500/30",
};

export default function AdminPayoutsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Payouts</h1>
        <p className="text-zinc-400">Track payout requests and approvals.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Payout</TableHead>
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Method</TableHead>
              <TableHead className="text-zinc-400 text-right">Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id} className="border-zinc-900">
                <TableCell className="text-white">{payout.id}</TableCell>
                <TableCell className="text-zinc-300">{payout.user}</TableCell>
                <TableCell className="text-zinc-300">{payout.amount}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[payout.status]}`}>
                    {payout.status}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-300">{payout.method}</TableCell>
                <TableCell className="text-right text-zinc-300">{payout.requested}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
