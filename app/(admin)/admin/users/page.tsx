import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const users = [
  {
    id: "U-1001",
    name: "Arlene McCoy",
    email: "arlene@example.com",
    role: "Trader",
    status: "Active",
    lastLogin: "2025-12-12 14:10",
  },
  {
    id: "U-1002",
    name: "Kathryn Murphy",
    email: "kathryn@example.com",
    role: "Trader",
    status: "Flagged",
    lastLogin: "2025-12-12 12:02",
  },
  {
    id: "U-1003",
    name: "Jerome Bell",
    email: "jerome@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-12-12 09:45",
  },
  {
    id: "U-1004",
    name: "Robert Fox",
    email: "robert@example.com",
    role: "Trader",
    status: "Suspended",
    lastLogin: "2025-12-11 19:30",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  Flagged: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Suspended: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
};

export default function AdminUsersPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Users</h1>
        <p className="text-zinc-400">Manage user roles, access, and account status.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Last Login</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-zinc-900">
                <TableCell>
                  <div className="text-white text-sm">{user.name}</div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                </TableCell>
                <TableCell className="text-zinc-300">{user.role}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[user.status]}`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-300">{user.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <button className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50">
                    Manage
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
