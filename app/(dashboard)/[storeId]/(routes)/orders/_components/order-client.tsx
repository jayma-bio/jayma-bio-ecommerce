"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Heading } from "../../_components/shared/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { OrdersColumns, columns } from "./column";
import { ApiList } from "../../_components/shared/api-list";
import Link from "next/link";

interface OrderClientProps {
  data: OrdersColumns[];
}

export const OrdersClient = ({ data }: OrderClientProps) => {
  const params = useParams();
  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center justify-between">
          <Heading
            title={`Orders (${data.length})`}
            description="Manage orders for your store"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${params.storeId}/cancelled`}>
            <Button variant="outline">View Cancelled Orders</Button>
          </Link>
        </div>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="id" />
    </>
  );
};
