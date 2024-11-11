"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellAction } from "./cell-action";
import { CellImage } from "./cell-image";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type OrdersColumns = {
  id: string;
  phone: string;
  address: string;
  products: string;
  totalPrice: string;
  images: string[];
  isPaid: boolean;
  order_status: string;
  returned_items: string;
  return_reason: string;
  createdAt: string;
  payment_id: string;
  return_or_refund: string;
};

export const columns: ColumnDef<OrdersColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => (
      <div className="grid grid-cols-2 gap-2">
        <div className="overflow-hidden min-w-14 w-full h-full aspect-square rounded-md flex items-center justify-center relative">
          <Image
            src={row.original.images[0]}
            alt="product image"
            className="object-contain"
            fill
          />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "return_or_refund",
    header: "Return or Refund Type",
  },
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const { order_status } = row.original;

      return (
        <p
          className={cn(
            "text-sm font-medium",
            order_status === "Return Requested" && "text-emerald-500",
            order_status === "Return Approved" && "text-emerald-500",
            order_status === "Return Rejected" && "text-red-500",
            order_status === "Refund Rejected" && "text-red-500",
            order_status === "Refund Approved" && "text-emerald-500",
            order_status === "Refund Initiated" && "text-blue-500",
            order_status === "Refund Successful" && "text-emerald-500",
            order_status === "Return Initiated" && "text-blue-500",
            order_status === "Order Picked Up" && "text-blue-500",
            order_status === "Return Successful" && "text-emerald-500"
          )}
        >
          {order_status}
        </p>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
