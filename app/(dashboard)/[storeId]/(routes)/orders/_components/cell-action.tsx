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
import { Checkbox } from "@/components/ui/checkbox";

import axios from "axios";
import { OrdersColumns } from "./column";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CellActionProps {
  data: OrdersColumns;
}

const order_status_options = [
  "Order Confirmed",
  "Order Shipped",
  "Order Delivering",
  "Order Delivered",
  "Order Cancelled",
];

export const CellAction = ({ data }: CellActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [ConfirmDialogue, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this order."
  );
  const [ConfirmCancelDialogue, confirmCancel] = useConfirm(
    "Are you sure?",
    "You are about to cancel this order."
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

  const isOrderCancelled = data.order_status === "Order Cancelled";

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast("Order ID Copied");
  };

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

  const onUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setIsLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        order_status: selectedStatus,
      });
      router.refresh();
      toast.success("Order Updated");
      setSelectedStatus(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.log(`Client Error: ${error.message}`);
      toast.error("An error occurred,while updating the order");
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = async () => {
    const ok = await confirmCancel();
    if (ok) {
      try {
        setCancelLoading(true);
        await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
          order_status: "Order Cancelled",
        });
        router.refresh();
        toast.success("Order Updated");
        setSelectedStatus(null);
        setIsDialogOpen(false);
      } catch (error: any) {
        console.log(`Client Error: ${error.message}`);
        toast.error("An error occurred,while updating the order");
      } finally {
        setCancelLoading(false);
      }
    }
  };

  const isStatusDisabled = (status: string) => {
    return (
      isOrderCancelled ||
      (data.order_status === "Order Shipped" && status === "Order Confirmed") ||
      (data.order_status === "Order Delivering" &&
        (status === "Order Confirmed" || status === "Order Shipped")) ||
      data.order_status === "Order Delivered"
    );
  };

  const isStatusCompleted = (status: string) => {
    const statusIndex = order_status_options.indexOf(status);
    const currentStatusIndex = order_status_options.indexOf(data.order_status);
    return (
      statusIndex < currentStatusIndex &&
      currentStatusIndex < order_status_options.length - 1
    );
  };

  return (
    <>
      <ConfirmCancelDialogue />
      <ConfirmDialogue />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-sm">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsViewDetailsDialogOpen(true)}
          >
            <Copy className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onCopy(data.id)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Id
          </DropdownMenuItem>
          {data.order_status === "Payment Successful" && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <PencilLine className="w-4 h-4 mr-2" />
              Update Status
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="cursor-pointer" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-normal text-green">
              Update Order Status
            </DialogTitle>
          </DialogHeader>
          <Separator className="w-full h-[0.5px] bg-green/40" />
          <div className="w-full flex items-center justify-center">
            <div className="w-2/4 flex flex-col space-y-4 mt-2">
              {order_status_options.map((status) => (
                <div key={status} className="w-full flex items-center gap-4">
                  <Checkbox
                    checked={
                      isStatusCompleted(status) ||
                      (isOrderCancelled && status === "Order Cancelled") ||
                      selectedStatus === status
                    }
                    onCheckedChange={(checked) => {
                      if (isStatusDisabled(status)) return;
                      setSelectedStatus(checked ? status : null);
                    }}
                    disabled={isStatusDisabled(status)}
                  />
                  <h1
                    className={cn(
                      "text-sm font-normal",
                      isStatusDisabled(status)
                        ? "text-green/30"
                        : "text-green/90",
                      isStatusCompleted(status) && "text-green/30 select-none"
                    )}
                  >
                    {status}
                  </h1>
                </div>
              ))}
            </div>
            <div className="w-2/4 flex items-center justify-center">
              <img src="/img/status.svg" alt="status" className="w-40" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="ghost"
              className="border border-green/50"
              onClick={() => {
                setSelectedStatus(null);
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={onCancel}
              disabled={
                cancelLoading ||
                data.order_status === "Order Delivered" ||
                isOrderCancelled
              }
              variant="destructive"
            >
              {cancelLoading ? "Cancelling" : "Cancel Order"}
              {cancelLoading && (
                <Loader2 className="size-6 ml-2 animate-spin" />
              )}
            </Button>
            <Button
              onClick={onUpdate}
              disabled={!selectedStatus || isLoading || isOrderCancelled}
            >
              {isLoading ? "Updating" : "Update"}
              {isLoading && <Loader2 className="size-6 ml-2 animate-spin" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
