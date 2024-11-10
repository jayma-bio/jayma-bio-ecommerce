import { db } from "@/lib/firebase";
import prismadb from "@/lib/prismadb";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getOrderStatusTotalRevenue = async (storeId: string) => {
  const paymentData = await prismadb.paymentManagement.findMany();
  const shippingCharge = Number(paymentData[0]?.shipping);
  const tax = Number(paymentData[0]?.tax);

  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const statusRevenue: { [key: string]: number } = {};

  const applyDiscount = (price: number, discount: number): number => {
    return price - price * (discount / 100);
  };

  for (const order of ordersData) {
    const status = order.order_status;

    if (status) {
      let revenueForOrder = 0;

      for (const item of order.orderItems) {
        if (item.qty !== undefined) {
          revenueForOrder +=
            applyDiscount(item.price, item.discount) * item.qty;
        } else {
          revenueForOrder += applyDiscount(item.price, item.discount);
        }
      }

      const totalTaxForItem = revenueForOrder * (tax / 100) + shippingCharge;
      statusRevenue[status] =
        (statusRevenue[status] || 0) + revenueForOrder + totalTaxForItem;
    }
  }

  // Create a map to convert month names to numeric representation
  const statusMap: { [key: string]: number } = {
    "Payment Successful": 0,
    "Order Confirmed": 1,
    "Order Delivered": 2,
    "Order Cancelled": 3,
  };

  // Update graphData using the month map
  const graphData: GraphData[] = Object.keys(statusMap).map((statusName) => ({
    name: statusName,
    total: statusRevenue[statusName] || 0,
  }));

  return graphData;
};
