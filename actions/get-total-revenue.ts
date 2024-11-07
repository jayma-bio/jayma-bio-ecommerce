import { db } from "@/lib/firebase";
import prismadb from "@/lib/prismadb";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

export const getTotalRevenue = async (storeId: string) => {
  const data = await prismadb.paymentManagement.findMany();

  const ordersDatForCount = await getDocs(
    collection(doc(db, "stores", storeId), "orders")
  );

  const shippingCharge = Number(data[0].shipping);
  const tax = Number(data[0].tax);

  const totalOrderCount = ordersDatForCount.size;

  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const applyDiscount = (price: number, discount: number): number => {
    return price - price * (discount / 100);
  };

  const totalShippingCharge = shippingCharge * totalOrderCount;

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      if (item.qty !== undefined) {
        return orderSum + applyDiscount(item.price, item.discount) * item.qty;
      } else {
        return orderSum + applyDiscount(item.price, item.discount);
      }
    }, 0);

    const totalTaxForOrder = orderTotal * (tax / 100);
    return total + orderTotal + totalTaxForOrder;
  }, 0);

  return totalRevenue + totalShippingCharge;
};
