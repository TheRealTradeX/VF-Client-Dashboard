"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DocumentsPanel() {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Upload documents</CardTitle>
          <CardDescription>Document management will be enabled in a later phase.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>Upload document</Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Your documents</CardTitle>
          <CardDescription>Uploaded documents will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900">
                <TableHead className="text-zinc-400">Document</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-zinc-900">
                <TableCell colSpan={4} className="text-center text-sm text-zinc-500">
                  No documents uploaded yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
