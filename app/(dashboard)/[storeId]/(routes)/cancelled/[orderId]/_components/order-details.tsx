"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types-db";
import { ChevronLeft } from "lucide-react";
import OrderDetailsItem from "./order-details-item";
import Link from "next/link";
import { useParams } from "next/navigation";
import DetailsBox from "../../../orders/[orderId]/_components/details-box";

interface OrderDetailsPageProps {
  order: Order;
}
const OrderDetails = ({ order }: OrderDetailsPageProps) => {
  const params = useParams();

  return (
    <section className="w-full min-h-screen h-full flex flex-col max-w-screen-2xl mx-auto gap-3 md:gap-5 px-5 md:px-10 lg:px-14 mt-5 md:mt-8 py-4 md:py-6">
      <div className="w-full flex flex-col gap-2 md:gap-4">
        <div className="w-full flex items-center justify-start mt-2 md:mt-4">
          <Link href={`/${params.storeId}/cancelled`}>
            <Button
              className="flex items-center gap-2 text-green"
              variant="outline"
            >
              <ChevronLeft className="size-5 shrink-0 text-green" />
              Back
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-3">
        <div className="w-full flex flex-col gap-4 pt-3 md:pt-5 md:px-3">
          <h1 className="text-2xl md:text-3xl font-medium text-green">
            Cancelled Order Items
          </h1>
          <Separator className="h-[1px] w-full bg-separator" />
          <div className="w-full flex flex-col gap-2">
            {order?.cancelled_items?.length > 0 &&
              order.cancelled_items.map((orderItem) => (
                <OrderDetailsItem key={orderItem.id} item={orderItem} />
              ))}
          </div>
        </div>
        <Separator
          orientation="vertical"
          className="min-h-[300px] h-full w-[1px] bg-separator hidden md:block"
        />
      </div>

      <div className="w-full flex flex-col gap-4 pt-3 md:pt-5 md:px-3">
        <div className="w-full flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-medium text-green">
            User Details
          </h1>
          <Separator className="h-[1px] w-full bg-separator" />
          <div className="flex justify-between items-center gap-28">
            <div className="w-full grid grid-cols-4 gap-4">
              <DetailsBox name="User Id" value={order.userId} />
              <DetailsBox name="Name" value={order.name} />
              <DetailsBox name="Email" value={order.email} />
              <DetailsBox name="Phone" value={order.phone} />
              <DetailsBox name="Address" value={order.address} />
              {order.paymentId && (
                <DetailsBox name="Payment Id" value={order.paymentId} />
              )}
              <DetailsBox name="Order Id" value={order.id} />
              <DetailsBox name="Order Status" value={order.order_status} />
            </div>
          </div>
          <Separator className="h-[1px] w-full bg-separator" />
        </div>
        <div className="w-full flex pb-10">
          <div className="flex items-center gap-44 px-4 py-3 bg-green rounded-lg">
            <h1 className="text-lg text-white">Total Refundable Amount</h1>
            <h1 className="text-lg text-white">
              <span className="mr-2">Rs</span>
              {order.refundableamount}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
