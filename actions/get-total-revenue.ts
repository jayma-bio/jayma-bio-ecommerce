import { db } from "@/lib/firebase";
import prismadb from "@/lib/prismadb";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

export const getTotalRevenue = async (storeId: string) => {
  const data = await prismadb.paymentManagement.findMany();

  const shippingCharge = Number(data[0]?.shipping) || 0;
  const tax = Number(data[0]?.tax) || 0;

  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  console.log(ordersData.map((order) => order.orderItems));

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const applyDiscount = (price: number, discount: number): number => {
    return price - price * (discount / 100);
  };

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemDiscount = Number(item.discount) || 0;
      const itemQty = Number(item.qty) || 1;
      
      return orderSum + applyDiscount(itemPrice, itemDiscount) * itemQty;
    }, 0);

    const totalTaxForOrder = orderTotal * (tax / 100) + shippingCharge;
    return total + orderTotal + totalTaxForOrder;
  }, 0);

  return totalRevenue;
};
