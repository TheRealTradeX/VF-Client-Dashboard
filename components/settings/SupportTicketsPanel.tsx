"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SupportTicketsPanel() {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Support tickets</CardTitle>
            <CardDescription>Track your open requests and responses.</CardDescription>
          </div>
          <Button disabled>New ticket</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900">
                <TableHead className="text-zinc-400">Ticket</TableHead>
                <TableHead className="text-zinc-400">Subject</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-zinc-900">
                <TableCell colSpan={4} className="text-center text-sm text-zinc-500">
                  No support tickets yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Quick help</CardTitle>
          <CardDescription>Common topics and guidance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" disabled className="w-full justify-start">
            Request a payout
          </Button>
          <Button variant="outline" disabled className="w-full justify-start">
            Trading rules overview
          </Button>
          <Button variant="outline" disabled className="w-full justify-start">
            Account verification requirements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
