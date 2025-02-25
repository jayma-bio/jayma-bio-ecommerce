import { db } from "@/lib/firebase";
import prismadb from "@/lib/prismadb";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getGraphTotalRevenue = async (storeId: string) => {
  const data = await prismadb.paymentManagement.findMany();

  const shippingCharge = isNaN(Number(data[0]?.shipping)) ? 0 : Number(data[0]?.shipping);
  const tax = isNaN(Number(data[0]?.tax)) ? 0 : Number(data[0]?.tax);

  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const monthlyRevenue: { [key: string]: number } = {};

  const applyDiscount = (price: number, discount: number): number => {
    return price - price * (discount / 100);
  };

  for (const order of paidOrders) {
    const month = order.createdAt
      ?.toDate()
      .toLocaleDateString("en-US", { month: "short" });

    if (month) {
      let revenueForOrder = 0;

      const orderTotal = order.orderItems.reduce((orderSum, item) => {
        const itemPrice = isNaN(item.price) ? 0 : item.price;
        const itemDiscount = isNaN(item.discount) ? 0 : item.discount;
        const itemQty = isNaN(Number(item.qty)) ? 1 : Number(item.qty);
        
        return orderSum + applyDiscount(itemPrice, itemDiscount) * itemQty;
      }, 0);

      const totalTaxForOrder = orderTotal * (tax / 100) + shippingCharge;
      revenueForOrder = orderTotal + totalTaxForOrder;

      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
    }
  }

  // Create a map to convert month names to numeric representation
  const monthMap: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  //   update the graph data
  const graphData: GraphData[] = Object.keys(monthMap).map((monthName) => ({
    name: monthName,
    total: monthlyRevenue[monthName] || 0,
  }));

  return graphData;
};