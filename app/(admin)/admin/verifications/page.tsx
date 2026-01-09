import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const verificationQueue = [
  {
    id: "KYC-1001",
    user: "Arlene McCoy",
    document: "Passport",
    status: "Pending",
    updated: "2025-12-12 13:45",
  },
  {
    id: "KYC-1002",
    user: "Kathryn Murphy",
    document: "Drivers License",
    status: "Review",
    updated: "2025-12-12 10:30",
  },
  {
    id: "KYC-1003",
    user: "Robert Fox",
    document: "Passport",
    status: "Denied",
    updated: "2025-12-11 18:22",
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Review: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  Denied: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
};

export default function AdminVerificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Verifications</h1>
        <p className="text-zinc-400">Review KYC submissions and identity checks.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-white text-lg mb-1">KYC Controls (Stub)</h2>
          <p className="text-sm text-zinc-500">
            Manual status changes only. No vendor automation is enabled for MVP.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Mark In Review
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Approve
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Case</TableHead>
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Document</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Updated</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verificationQueue.map((item) => (
              <TableRow key={item.id} className="border-zinc-900">
                <TableCell className="text-white">{item.id}</TableCell>
                <TableCell className="text-zinc-300">{item.user}</TableCell>
                <TableCell className="text-zinc-300">{item.document}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-300">{item.updated}</TableCell>
                <TableCell className="text-right">
                  <button className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50">
                    Review
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
