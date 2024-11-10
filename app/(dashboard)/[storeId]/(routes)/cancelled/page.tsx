import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Order } from "@/types-db";
import { OrdersColumns } from "./_components/column";
import { priceFormatter } from "@/lib/utils";
import { OrdersClient } from "./_components/order-client";

const CancelledOrdersPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const ordersData = (
    await getDocs(collection(doc(db, "stores", params.storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const formattedOrders: OrdersColumns[] = ordersData
    .filter((item) => item.isCancelled)
    .map((item) => ({
      id: item.id,
      phone: item.phone,
      address: item.address,
      isPaid: item.isPaid,
      products: item.orderItems.map((item) => item.name).join(", "),
      order_status: item.order_status,
      totalPrice: priceFormatter.format(item.refundableamount),
      images: item.cancelled_items.map((item) => item.images[0].url),
      cancelled_items: item.cancelled_items.map((item) => item.name).join(", "),
      createdAt:
        item.createdAt && format(item.createdAt.toDate(), "MMMM do, yyyy"),
      payment_id: item.paymentId,
    }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default CancelledOrdersPage;
