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
  createdAt: string;
  payment_id: string;
};

export const columns: ColumnDef<OrdersColumns>[] = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => (
      <div className="grid grid-cols-2 gap-2">
        <div className="overflow-hidden min-h-16 min-w-16 w-full h-full aspect-square rounded-md flex items-center justify-center relative">
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
    accessorKey: "totalPrice",
    header: "Amount",
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
            order_status === "Order Confirmed" && "text-emerald-600",
            order_status === "Order Delivered" && "text-teal-700",
            order_status === "Order Cancelled" && "text-red-600",
            order_status === "Order Processing" && "text-yellow-600",
            order_status === "Order Delivering" && "text-orange-500",
            order_status === "Order Shipped" && "text-blue-600",
            order_status === "Payment Successful" && "text-emerald-400",
            order_status === "Payment Failed" && "text-red-600",
            order_status === "Payment Processing" && "text-yellow-600"
          )}
        >
          {order_status}
        </p>
      );
    },
  },
  // {
  //   accessorKey: "isPaid",
  //   header: "Payment Status",
  //   cell: ({ row }) => {
  //     const { isPaid } = row.original;

  //     return (
  //       <p
  //         className={cn(
  //           "text-sm font-medium",
  //           isPaid ? "text-emerald-500" : "text-red-500"
  //         )}
  //       >
  //         {isPaid ? "Paid" : "Not Paid"}
  //       </p>
  //     );
  //   },
  // },
  {
    accessorKey: "products",
    header: "Products",
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
