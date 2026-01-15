"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function BillingHistory() {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Stripe billing will appear once enabled.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">No payment methods on file yet.</div>
          <Button disabled>Manage billing</Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
          <CardDescription>Invoices are listed here after your first purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900">
                <TableHead className="text-zinc-400">Invoice ID</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">Description</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-zinc-900">
                <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                  No invoices yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
