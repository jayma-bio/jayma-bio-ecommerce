import { db } from "@/lib/firebase";
import prismadb from "@/lib/prismadb";
import { Category, Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getOrderTotalRevenueByCategory = async (storeId: string) => {
  const ordersSnapshot = await getDocs(
    collection(doc(db, "stores", storeId), "orders")
  );
  const categoriesSnapshot = await getDocs(
    collection(doc(db, "stores", storeId), "categories")
  );

  const paymentData = await prismadb.paymentManagement.findMany();
  const shippingCharge = Number(paymentData[0].shipping);
  const tax = Number(paymentData[0].tax);

  const ordersData = ordersSnapshot.docs.map((doc) => doc.data()) as Order[];
  const categories = categoriesSnapshot.docs.map((doc) =>
    doc.data()
  ) as Category[];

  const categoryRevenue: { [key: string]: number } = {};

  const paidOrders = ordersData.filter((order) => order.isPaid);

  const applyDiscount = (price: number, discount: number): number => {
    return price - price * (discount / 100);
  };

  for (const order of paidOrders) {
    let orderTotal = 0;

    for (const item of order.orderItems) {
      const category = item.category;

      if (category) {
        let revenueForItem = 0;

        if (item.qty !== undefined) {
          revenueForItem = applyDiscount(item.price, item.discount) * item.qty;
        } else {
          revenueForItem = applyDiscount(item.price, item.discount);
        }

        const totalTaxForItem = revenueForItem * (tax / 100) + shippingCharge;
        categoryRevenue[category] =
          (categoryRevenue[category] || 0) + revenueForItem + totalTaxForItem;
        orderTotal += revenueForItem;
      }
    }
    for (const category of categories) {
      categoryRevenue[category.name] = categoryRevenue[category.name] || 0;
    }
  }

  // Update graphData using the categories array
  const graphData: GraphData[] = categories.map((category) => ({
    name: category.name,
    total: categoryRevenue[category.name] || 0,
  }));

  return graphData;
};
