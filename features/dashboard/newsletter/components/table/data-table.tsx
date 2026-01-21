"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns, Newsletter } from "./columns";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NewsletterDateProps {
  data: Newsletter[];
}

export function NewsletterDataTable({ data }: NewsletterDateProps) {
  const pathname = usePathname();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const show = pathname === "/dashboard";

  return (
    <div className="overflow-hidden rounded-md border p-5">
      <div className="flex justify-between items-center mb-10">
        <div className="">
          {show && <h3 className="text-zuimi-heading">Newsletter History</h3>}
          <p className="text-zuimi-subtitle">Recent newsletters and their performance</p>
        </div>
        {show && (
          <Link
            href={"/dashboard/newsletter"}
            className="border px-4 py-3 rounded-lg"
          >
            View All
          </Link>
        )}
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
