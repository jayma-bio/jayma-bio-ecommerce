import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, MoreVertical, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import axios from "axios";
import { OrdersColumns } from "./column";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface CellActionProps {
  data: OrdersColumns;
}

export const CellAction = ({ data }: CellActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ConfirmDialogue, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this order."
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (isDialogOpen) {
      setSelectedStatus(data.order_status);
    }
  }, [isDialogOpen, data.order_status]);

  const onDelete = async () => {
    setIsLoading(true);
    const ok = await confirm();

    if (ok) {
      try {
        await axios.delete(`/api/${params.storeId}/orders/${data.id}`);
        router.refresh();
        toast.success("Order Deleted");
        setIsLoading(false);
      } catch (error: any) {
        console.log(`Client Error: ${error.message}`);
        toast.error("An error occurred,while deleting the order");
        setIsLoading(false);
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <ConfirmDialogue />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-sm">
          <DropdownMenuItem className="cursor-pointer">
            <Link
              href={`/${params.storeId}/cancelled/${data.id}`}
              className="flex"
            >
              <Copy className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onDelete();
            }}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
      >
        <DialogContent className="!p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-normal text-green">
              Order Details
            </DialogTitle>
          </DialogHeader>
          <Separator className="w-full h-[0.5px] bg-green/40" />
          <div className="w-full flex flex-col space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green">Order ID</h3>
              <p className="text-sm font-normal text-green/90">{data.id}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="ghost"
              className="border border-green/50"
              onClick={() => setIsViewDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
