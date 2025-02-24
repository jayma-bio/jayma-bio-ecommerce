import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Order } from "@/types-db";
import { OrdersColumns } from "./_components/column";
import { priceFormatter } from "@/lib/utils";
import { OrdersClient } from "./_components/order-client";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const ordersData = (
    await getDocs(collection(doc(db, "stores", params.storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const formattedOrders: OrdersColumns[] = ordersData
  .filter((item) => item.order_status !== "Order Cancelled")
  .map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    isPaid: item.isPaid,
    products: item.orderItems.map((item) => item.name).join(", "),
    order_status: item.order_status,
    totalPrice: priceFormatter.format(item.amount),
    images: item.orderItems.map((item) => item.images[0].url),
    createdAt:
      item.createdAt && format(item.createdAt.toDate(), "MMMM do, yyyy"),
    payment_id: item.paymentId,
    isCancelled: item.isCancelled,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
